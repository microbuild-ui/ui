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

/**
 * Directus file representation - matches the actual Directus API response
 */
export interface DirectusFile {
  id: string;
  storage: string;
  filename_disk: string | null;
  filename_download: string;
  title: string | null;
  description?: string | null;
  type: string | null;
  filesize: number;
  width?: number | null;
  height?: number | null;
  uploaded_on: string | null;
  uploaded_by: string | null;
  modified_on?: string;
  folder: string | null;
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

  /**
   * Generic GET request with options (for downloading files/assets)
   */
  async get(path: string, options?: { responseType?: 'arraybuffer' | 'blob'; params?: Record<string, unknown> }): Promise<{ data: ArrayBuffer | Blob; headers: Record<string, string> }> {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    if (options?.responseType === 'blob') {
      return { data: await response.blob(), headers: responseHeaders };
    }
    return { data: await response.arrayBuffer(), headers: responseHeaders };
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
   * Update a file's metadata
   */
  async updateFile(id: string, data: Partial<DirectusFile>): Promise<DirectusFile> {
    return this.request<DirectusFile>(`/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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
