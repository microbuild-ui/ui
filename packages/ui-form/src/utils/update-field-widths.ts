/**
 * Update field widths based on visibility and layout rules
 * Based on Directus update-field-widths utility
 */

import type { FormField, FieldWidth } from '../types';
import { isFieldVisible } from './get-form-fields';

/**
 * Update field widths to ensure proper grid layout
 * - Converts 'fill' widths to appropriate values based on position
 * - Ensures last field in row is 'full' width if it's 'half'
 * - Handles visible field filtering
 */
export function updateFieldWidths(fields: FormField[]): FormField[] {
  const visibleFields = fields.filter(isFieldVisible);
  
  let currentRowWidth = 0;
  const updatedFields: FormField[] = [];

  for (let i = 0; i < visibleFields.length; i++) {
    const field = { ...visibleFields[i] };
    let width = (field.meta?.width as FieldWidth) || 'full';

    // Handle 'fill' width
    if (width === 'fill') {
      // If we're at the start of a row, make it half
      if (currentRowWidth === 0) {
        width = 'half';
      } else {
        // Otherwise, fill the remaining space
        width = currentRowWidth === 0.5 ? 'half' : 'full';
      }
    }

    // Calculate width value for tracking
    const widthValue = width === 'full' ? 1 : 0.5;

    // If adding this field would overflow the row, reset to new row
    if (currentRowWidth + widthValue > 1) {
      currentRowWidth = widthValue;
    } else {
      currentRowWidth += widthValue;
    }

    // Update field width
    if (field.meta) {
      field.meta = {
        ...field.meta,
        width,
      };
    }

    // Reset row width if we've completed a full row
    if (currentRowWidth >= 1) {
      currentRowWidth = 0;
    }

    updatedFields.push(field);
  }

  // Ensure last field fills the row if it's half width
  if (updatedFields.length > 0 && currentRowWidth === 0.5) {
    const lastField = updatedFields[updatedFields.length - 1];
    if (lastField.meta) {
      lastField.meta = {
        ...lastField.meta,
        width: 'full',
      };
    }
  }

  return updatedFields;
}

/**
 * Get CSS class for field width
 */
export function getFieldWidthClass(width: FieldWidth | undefined): string {
  switch (width) {
    case 'half':
    case 'half-left':
    case 'half-right':
      return 'field-width-half';
    case 'fill':
      return 'field-width-fill';
    case 'full':
    default:
      return 'field-width-full';
  }
}
