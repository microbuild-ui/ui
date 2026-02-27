/**
 * @buildpad/ui-form
 * Dynamic form component system
 * 
 * Security Features (following DaaS architecture):
 * - Field-level permissions filtering (show only accessible fields)
 * - Action-based permissions (create, read, update mode)
 * - Integration with DaaSProvider for authenticated requests
 */

export { VForm } from './VForm';
export type { VFormProps, FormAction } from './VForm';
export { FormField } from './components/FormField';
export type { FormFieldProps } from './components/FormField';
export { FormFieldLabel } from './components/FormFieldLabel';
export { FormFieldInterface } from './components/FormFieldInterface';
export type { FormFieldInterfaceProps } from './components/FormFieldInterface';

export * from './types';
export * from './utils';
