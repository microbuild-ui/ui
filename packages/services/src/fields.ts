/**
 * FieldsService - Service for managing database fields/columns
 * 
 * Uses Next.js API routes to proxy requests to DaaS backend (avoids CORS)
 */

import type { Field } from '@buildpad/types';
import { apiRequest } from './api-request';

/**
 * Fields Service
 */
export class FieldsService {
  /**
   * Read all fields across all collections or in a specific collection
   */
  async readAll(collection?: string): Promise<Field[]> {
    try {
      const path = collection
        ? `/api/fields/${collection}`
        : '/api/fields';

      const response = await apiRequest<{ data: Field[] }>(path);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching fields:', error);
      return [];
    }
  }

  /**
   * Read a single field
   */
  async readOne(collection: string, field: string): Promise<Field> {
    const response = await apiRequest<{ data: Field }>(`/api/fields/${collection}/${field}`);
    if (!response.data) {
      throw new Error(`Field not found: ${collection}.${field}`);
    }
    return response.data;
  }
}

/**
 * Factory function to create a new FieldsService instance
 */
export function createFieldsService(): FieldsService {
  return new FieldsService();
}
