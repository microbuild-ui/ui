/**
 * ItemsService - Generic service for CRUD operations on any collection
 * Inspired by Directus ItemsService
 * 
 * Uses Next.js API routes to proxy requests to DaaS backend (avoids CORS)
 */

import type {
  PrimaryKey,
  AnyItem,
  Query,
  MutationOptions,
  AbstractServiceOptions,
  Accountability,
  MutationTracker,
} from '@microbuild/types';
import { apiRequest } from './api-request';

// Default batch mutation limit - can be overridden by app-level config
const MAX_BATCH_MUTATION = 100;

/**
 * Generic Items Service for any collection
 */
export class ItemsService<Item extends AnyItem = AnyItem, Collection extends string = string> {
  collection: Collection;
  accountability: Accountability | null;
  nested: string[];
  primaryKeyField: string;

  constructor(collection: Collection, options: AbstractServiceOptions = {}) {
    this.collection = collection;
    this.accountability = options.accountability || null;
    this.nested = options.nested || [];
    this.primaryKeyField = 'id';
  }

  /**
   * Create a mutation tracker
   */
  createMutationTracker(initialCount = 0): MutationTracker {
    let mutationCount = initialCount;
    return {
      trackMutations(count: number) {
        mutationCount += count;
        if (mutationCount > MAX_BATCH_MUTATION) {
          throw new Error(
            `Mutation limit exceeded. Maximum ${MAX_BATCH_MUTATION} mutations allowed per request.`
          );
        }
      },
      getCount() {
        return mutationCount;
      },
    };
  }

  /**
   * Build query parameters for HTTP request
   */
  private buildQueryParams(query: Query = {}): URLSearchParams {
    const params = new URLSearchParams();

    if (query.fields) {
      params.append('fields', Array.isArray(query.fields) ? query.fields.join(',') : String(query.fields));
    }

    if (query.filter) {
      params.append('filter', JSON.stringify(query.filter));
    }

    if (query.search) {
      params.append('search', query.search);
    }

    if (query.sort) {
      const sorts = Array.isArray(query.sort) ? query.sort : [query.sort];
      params.append('sort', sorts.join(','));
    }

    if (query.limit) {
      params.append('limit', String(query.limit));
    }

    if (query.offset) {
      params.append('offset', String(query.offset));
    } else if (query.page && query.limit) {
      params.append('page', String(query.page));
    }

    if (query.meta) {
      params.append('meta', Array.isArray(query.meta) ? query.meta.join(',') : String(query.meta));
    }

    return params;
  }

  /**
   * Read items by query with permission filtering
   */
  async readByQuery(query: Query = {}): Promise<Item[]> {
    const params = this.buildQueryParams(query);
    const queryString = params.toString();
    const path = `/api/items/${this.collection}${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<{ data: Item[] }>(path);
    return response.data || [];
  }

  /**
   * Read a single item by primary key
   */
  async readOne(key: PrimaryKey, query: Query = {}): Promise<Item> {
    const params = this.buildQueryParams(query);
    const queryString = params.toString();
    const path = `/api/items/${this.collection}/${key}${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<{ data: Item }>(path);
    if (!response.data) {
      throw new Error(`Item not found: ${this.collection}/${key}`);
    }
    return response.data;
  }

  /**
   * Read multiple items by primary keys
   */
  async readMany(keys: PrimaryKey[], query: Query = {}): Promise<Item[]> {
    const filterWithKey = {
      [this.primaryKeyField]: { _in: keys },
    };

    const queryWithKey = {
      ...query,
      filter: query.filter
        ? { _and: [query.filter, filterWithKey] }
        : filterWithKey,
    };

    return this.readByQuery(queryWithKey);
  }

  /**
   * Create a single item
   */
  async createOne(data: Partial<Item>, opts: MutationOptions = {}): Promise<PrimaryKey> {
    if (opts.mutationTracker) {
      opts.mutationTracker.trackMutations(1);
    }

    const response = await apiRequest<{ data: Item }>(
      `/api/items/${this.collection}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response.data[this.primaryKeyField] as PrimaryKey;
  }

  /**
   * Create multiple items
   */
  async createMany(data: Partial<Item>[], opts: MutationOptions = {}): Promise<PrimaryKey[]> {
    if (opts.mutationTracker) {
      opts.mutationTracker.trackMutations(data.length);
    }

    const response = await apiRequest<{ data: Item[] }>(
      `/api/items/${this.collection}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response.data.map((item) => item[this.primaryKeyField] as PrimaryKey);
  }

  /**
   * Update a single item
   */
  async updateOne(key: PrimaryKey, data: Partial<Item>, opts: MutationOptions = {}): Promise<PrimaryKey> {
    if (opts.mutationTracker) {
      opts.mutationTracker.trackMutations(1);
    }

    await apiRequest(
      `/api/items/${this.collection}/${key}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );

    return key;
  }

  /**
   * Update multiple items by keys
   */
  async updateMany(keys: PrimaryKey[], data: Partial<Item>, opts: MutationOptions = {}): Promise<PrimaryKey[]> {
    if (opts.mutationTracker) {
      opts.mutationTracker.trackMutations(keys.length);
    }

    await apiRequest(
      `/api/items/${this.collection}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          keys,
          data,
        }),
      }
    );

    return keys;
  }

  /**
   * Update items by query
   */
  async updateByQuery(query: Query, data: Partial<Item>, opts: MutationOptions = {}): Promise<PrimaryKey[]> {
    const keys = await this.getKeysByQuery(query);
    return this.updateMany(keys, data, opts);
  }

  /**
   * Delete a single item
   */
  async deleteOne(key: PrimaryKey, opts: MutationOptions = {}): Promise<PrimaryKey> {
    if (opts.mutationTracker) {
      opts.mutationTracker.trackMutations(1);
    }

    await apiRequest(
      `/api/items/${this.collection}/${key}`,
      {
        method: 'DELETE',
      }
    );

    return key;
  }

  /**
   * Delete multiple items by keys
   */
  async deleteMany(keys: PrimaryKey[], opts: MutationOptions = {}): Promise<PrimaryKey[]> {
    if (opts.mutationTracker) {
      opts.mutationTracker.trackMutations(keys.length);
    }

    await apiRequest(
      `/api/items/${this.collection}`,
      {
        method: 'DELETE',
        body: JSON.stringify(keys),
      }
    );

    return keys;
  }

  /**
   * Get primary keys matching a query
   */
  async getKeysByQuery(query: Query): Promise<PrimaryKey[]> {
    const readQuery = { ...query };
    readQuery.fields = [this.primaryKeyField];

    const items = await this.readByQuery(readQuery);
    return items.map((item: AnyItem) => item[this.primaryKeyField] as PrimaryKey).filter((pk) => pk);
  }
}

/**
 * Factory function to create a new ItemsService instance
 */
export function createItemsService<Item extends AnyItem = AnyItem>(
  collection: string,
  options: AbstractServiceOptions = {}
): ItemsService<Item> {
  return new ItemsService<Item>(collection, options);
}
