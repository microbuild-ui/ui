/**
 * Utility exports for VForm
 * 
 * VForm-specific utilities that don't exist in @buildpad/utils.
 * For field interface mapping and readonly checks, use @buildpad/utils directly.
 */

export { getDefaultValuesFromFields } from './get-default-values';
export { 
  getFormFields, 
  isFieldVisible, 
  isGroupField, 
  getFieldsInGroup 
} from './get-form-fields';
export { 
  updateFieldWidths, 
  getFieldWidthClass 
} from './update-field-widths';

// Re-export commonly used utilities from @buildpad/utils for convenience
export { 
  getFieldInterface,
  getFieldDefault,
  isFieldReadOnly,
  getFieldValidation,
  isPresentationField,
  type InterfaceConfig,
  type InterfaceType,
} from '@buildpad/utils';
