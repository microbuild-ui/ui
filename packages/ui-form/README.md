# @microbuild/ui-form

Dynamic form component system for building Directus-compatible forms.

## Features

- 🎯 **VForm Component** - Main dynamic form component that renders fields based on collection schema
- 📝 **FormField Component** - Individual field wrapper with label, validation, and interface rendering
- 🔌 **Interface Integration** - Automatically loads appropriate interface component based on field type
- 🎨 **Field Metadata** - Respects meta configuration from `directus_fields` table (interface, options, display)
- 📊 **Field Groups** - Support for nested field groups and hierarchical organization
- ✅ **Validation** - Built-in validation error display and handling
- 🔄 **Change Tracking** - Track edited fields and manage form state
- 📱 **Responsive** - Automatic grid layout with field width support (full, half, fill)

## Installation

```bash
pnpm add @microbuild/ui-form
```

## Usage

### Basic Form

```tsx
import { VForm } from '@microbuild/ui-form';

function MyForm() {
  const [values, setValues] = useState({});

  return (
    <VForm
      collection="articles"
      modelValue={values}
      onUpdate={setValues}
    />
  );
}
```

### With Initial Values

```tsx
<VForm
  collection="articles"
  initialValues={{ title: 'Default Title', status: 'draft' }}
  modelValue={values}
  onUpdate={setValues}
/>
```

### Edit Mode

```tsx
<VForm
  collection="articles"
  primaryKey={itemId}
  initialValues={existingItem}
  modelValue={changes}
  onUpdate={setChanges}
/>
```

### With Validation Errors

```tsx
<VForm
  collection="articles"
  modelValue={values}
  onUpdate={setValues}
  validationErrors={[
    { field: 'title', type: 'required', message: 'Title is required' },
    { field: 'email', type: 'email', message: 'Invalid email format' }
  ]}
/>
```

## API Reference

### VForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collection` | `string` | Required | Collection name to load fields from |
| `fields` | `Field[]` | - | Optional explicit field list (overrides collection) |
| `modelValue` | `Record<string, any>` | `{}` | Current form values (edited fields only) |
| `initialValues` | `Record<string, any>` | `{}` | Initial/default values for the form |
| `onUpdate` | `(values) => void` | - | Callback when form values change |
| `primaryKey` | `string \| number` | - | Primary key for edit mode ('+' for create) |
| `disabled` | `boolean` | `false` | Disable all fields |
| `loading` | `boolean` | `false` | Show loading state |
| `validationErrors` | `ValidationError[]` | `[]` | Array of validation errors to display |
| `group` | `string \| null` | `null` | Show only fields in specific group |
| `showDivider` | `boolean` | `false` | Show divider between system and user fields |
| `excludeFields` | `string[]` | `[]` | Fields to exclude from rendering |

### FormField Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `field` | `Field` | Required | Field definition with schema and meta |
| `value` | `any` | - | Current field value |
| `onChange` | `(value) => void` | - | Change handler |
| `disabled` | `boolean` | `false` | Disable the field |
| `error` | `string` | - | Validation error message |
| `autofocus` | `boolean` | `false` | Auto-focus on mount |

## Architecture

```
VForm
├── Field Loading (from API or props)
├── Field Processing
│   ├── System vs User field separation
│   ├── Field sorting (by group, sort, id)
│   ├── Conditional visibility
│   └── Field width calculation
├── Grid Layout
│   └── Responsive columns (2-col on desktop, 1-col on mobile)
└── FormField Components
    ├── Field Label
    ├── Interface Component (dynamic)
    │   ├── Input
    │   ├── Boolean
    │   ├── DateTime
    │   ├── Select
    │   ├── ListM2M
    │   └── ... (40+ interfaces)
    └── Validation Errors
```

## Related Packages

- `@microbuild/ui-interfaces` - Individual interface components
- `@microbuild/services` - API services for data fetching
- `@microbuild/types` - TypeScript type definitions
- `@microbuild/utils` - Utility functions

## License

MIT
