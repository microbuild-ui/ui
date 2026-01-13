/**
 * Permissions Service
 * Fetches field-level permissions from DaaS backend
 */

import { apiRequest } from './api-request';

export interface FieldPermissions {
  collection: string;
  action: string;
  fields: string[]; // Array of allowed field names, or ['*'] for all fields
}

/**
 * Permissions Service
 */
export class PermissionsService {
  /**
   * Get accessible fields for a collection and action
   * @param collection - Collection name
   * @param action - Action type (create, read, update, delete)
   * @returns Promise containing field permissions
   */
  static async getFieldPermissions(
    collection: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ): Promise<FieldPermissions> {
    const response = await apiRequest<{ data: FieldPermissions }>(
      `/api/permissions/${collection}?action=${action}`
    );
    return response.data;
  }

  /**
   * Get accessible fields for all actions
   * @param collection - Collection name
   * @returns Promise containing permissions for all actions
   */
  static async getAllFieldPermissions(
    collection: string
  ): Promise<Record<string, FieldPermissions>> {
    const actions: Array<'create' | 'read' | 'update' | 'delete'> = [
      'create',
      'read',
      'update',
      'delete',
    ];

    const permissions: Record<string, FieldPermissions> = {};

    await Promise.all(
      actions.map(async (action) => {
        try {
          permissions[action] = await this.getFieldPermissions(collection, action);
        } catch (error) {
          console.error(`Failed to fetch ${action} permissions:`, error);
          // Default to no permissions on error
          permissions[action] = {
            collection,
            action,
            fields: [],
          };
        }
      })
    );

    return permissions;
  }

  /**
   * Check if a field is accessible for an action
   * @param fieldName - Field name to check
   * @param permissions - Field permissions object
   * @returns True if field is accessible
   */
  static isFieldAccessible(fieldName: string, permissions: FieldPermissions): boolean {
    // Wildcard means all fields are accessible
    if (permissions.fields.includes('*')) {
      return true;
    }

    // Check if field is in the allowed list
    return permissions.fields.includes(fieldName);
  }

  /**
   * Filter fields based on permissions
   * @param allFields - Array of all field names
   * @param permissions - Field permissions object
   * @returns Array of accessible field names
   */
  static filterAccessibleFields(
    allFields: string[],
    permissions: FieldPermissions
  ): string[] {
    // Wildcard means return all fields
    if (permissions.fields.includes('*')) {
      return allFields;
    }

    // Filter to only accessible fields
    return allFields.filter((field) => permissions.fields.includes(field));
  }
}

/**
 * Factory function to create a new PermissionsService instance
 */
export function createPermissionsService(): typeof PermissionsService {
  return PermissionsService;
}
