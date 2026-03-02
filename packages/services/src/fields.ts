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

      // Handle both { data: Field[] } (Directus) and Field[] (DaaS flat) formats
      const response = await apiRequest<{ data: Field[] } | Field[]>(path);
      if (Array.isArray(response)) return response;
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
    const response = await apiRequest<{ data: Field } | Field>(`/api/fields/${collection}/${field}`);
    // Handle both { data: Field } (Directus) and flat Field (DaaS) formats
    const fieldData = (response as { data: Field }).data ?? response;
    if (!fieldData || !(fieldData as Field).field) {
      throw new Error(`Field not found: ${collection}.${field}`);
    }
    return fieldData as Field;
  }
}

/**
 * Factory function to create a new FieldsService instance
 */
export function createFieldsService(): FieldsService {
  return new FieldsService();
}
