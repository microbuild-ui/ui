/**
 * CollectionsService - Service for managing database collections (tables/views)
 * 
 * Uses Next.js API routes to proxy requests to DaaS backend (avoids CORS)
 */

import type { Collection } from '@microbuild/types';
import { apiRequest } from './api-request';

/**
 * Collections Service
 */
export class CollectionsService {
  /**
   * Read all collections
   */
  async readByQuery(): Promise<Collection[]> {
    try {
      const response = await apiRequest<{ data: Collection[] }>('/api/collections');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Read a single collection by name
   */
  async readOne(collection: string): Promise<Collection> {
    const response = await apiRequest<{ data: Collection }>(`/api/collections/${collection}`);
    if (!response.data) {
      throw new Error(`Collection not found: ${collection}`);
    }
    return response.data;
  }
}

/**
 * Factory function to create a new CollectionsService instance
 */
export function createCollectionsService(): CollectionsService {
  return new CollectionsService();
}
