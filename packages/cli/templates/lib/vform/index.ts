/**
 * VForm - Dynamic Form Component
 * 
 * Re-exports VForm and related components.
 * This file is copied to your project and can be customized.
 * 
 * NOTE: Import paths must match actual file names (PascalCase for VForm folder)
 */

// Main VForm export - VForm.tsx uses PascalCase filename
export { VForm } from './VForm';
export type { VFormProps } from './VForm';

// Component exports - files in components/ use PascalCase
export { FormField } from './components/FormField';
export type { FormFieldProps } from './components/FormField';

export { FormFieldLabel } from './components/FormFieldLabel';

export { FormFieldInterface } from './components/FormFieldInterface';
export type { FormFieldInterfaceProps } from './components/FormFieldInterface';

export * from './types';
export * from './utils';
