/**
 * Directus-compatible API helpers
 * 
 * These are stub implementations that can be used in Storybook demos.
 * In production, these should be replaced with real API calls.
 */

export interface DirectusAPIConfig {
  baseUrl?: string;
  token?: string;
}

export interface QueryParams {
  fields?: string[];
  filter?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  sort?: string[];
}

export interface DirectusFile {
  id: string;
  filename_download: string;
  filename_disk: string;
  title?: string;
  type: string;
  filesize: number;
  width?: number;
  height?: number;
  uploaded_on: string;
  uploaded_by?: string;
  modified_on?: string;
}

/**
 * Directus API helper class
 * Provides methods for common API operations
 */
class DirectusAPI {
  private baseUrl: string;
  private token: string | null;

  constructor(config: DirectusAPIConfig = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.token = config.token || null;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data ?? data;
  }

  /**
   * Get items from a collection
   */
  async getItems<T = unknown>(collection: string, params?: QueryParams): Promise<T[]> {
    const query = new URLSearchParams();
    if (params?.fields) query.set('fields', params.fields.join(','));
    if (params?.filter) query.set('filter', JSON.stringify(params.filter));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.sort) query.set('sort', params.sort.join(','));

    const queryString = query.toString();
    const path = `/items/${collection}${queryString ? `?${queryString}` : ''}`;
    return this.request<T[]>(path);
  }

  /**
   * Get a single item by ID
   */
  async getItem<T = unknown>(collection: string, id: string | number, params?: QueryParams): Promise<T> {
    const query = new URLSearchParams();
    if (params?.fields) query.set('fields', params.fields.join(','));

    const queryString = query.toString();
    const path = `/items/${collection}/${id}${queryString ? `?${queryString}` : ''}`;
    return this.request<T>(path);
  }

  /**
   * Create a new item
   */
  async createItem<T = unknown>(collection: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(`/items/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing item
   */
  async updateItem<T = unknown>(collection: string, id: string | number, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(`/items/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an item
   */
  async deleteItem(collection: string, id: string | number): Promise<void> {
    await this.request(`/items/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get a file by ID
   */
  async getFile(id: string): Promise<DirectusFile> {
    return this.request<DirectusFile>(`/files/${id}`);
  }

  /**
   * Upload files
   */
  async uploadFiles(
    files: File[],
    options?: { folder?: string; onProgress?: (progress: number) => void }
  ): Promise<DirectusFile[]> {
    const results: DirectusFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      if (options?.folder) {
        formData.append('folder', options.folder);
      }

      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }

      const data = await response.json();
      results.push(data.data);
      
      options?.onProgress?.(((i + 1) / files.length) * 100);
    }

    return results;
  }

  /**
   * Check if user has permission for an action
   */
  async checkPermission(collection: string, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    try {
      // In a real implementation, this would check against the Directus permissions
      // For now, return true for demo purposes
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(id: string, transform?: { width?: number; height?: number; quality?: number }): string {
    let url = `${this.baseUrl}/assets/${id}`;
    if (transform) {
      const params = new URLSearchParams();
      if (transform.width) params.set('width', String(transform.width));
      if (transform.height) params.set('height', String(transform.height));
      if (transform.quality) params.set('quality', String(transform.quality));
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    return url;
  }
}

/**
 * Default API instance
 */
export const directusAPI = new DirectusAPI();

/**
 * Generic API helper (alias for directusAPI)
 */
export const api = directusAPI;

/**
 * Create a configured API instance
 */
export function createDirectusAPI(config: DirectusAPIConfig): DirectusAPI {
  return new DirectusAPI(config);
}
