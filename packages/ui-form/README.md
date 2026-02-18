# @microbuild/ui-form

Dynamic form component system for building DaaS-compatible forms with built-in permission enforcement.

## Exports

```typescript
// Components
import { VForm, FormField, FormFieldLabel, FormFieldInterface } from '@microbuild/ui-form';

// Types
import type { 
  VFormProps,
  FormAction,
  FormFieldProps, 
  FormFieldInterfaceProps,
  FormField as FormFieldType,
  ValidationError 
} from '@microbuild/ui-form';
```

## Features

- 🎯 **VForm Component** - Main dynamic form component that renders fields based on collection schema
- 🔐 **Permission Enforcement** - Filter fields based on user permissions (DaaS-compatible)
- 📝 **FormField Component** - Individual field wrapper with label, validation, and interface rendering
- 🔌 **Interface Integration** - Automatically loads appropriate interface component based on field type
- 🎨 **Field Metadata** - Respects meta configuration from `daas_fields` table (interface, options, display)
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

### With Permission Enforcement

The form can filter fields based on user permissions, following the DaaS security architecture:

```tsx
import { VForm } from '@microbuild/ui-form';
import { DaaSProvider } from '@microbuild/services';

function ProtectedForm() {
  const [values, setValues] = useState({});

  return (
    <DaaSProvider config={{ url: 'https://xxx.microbuild-daas.xtremax.com', token: 'xxx' }}>
      <VForm
        collection="articles"
        modelValue={values}
        onUpdate={setValues}
        enforcePermissions={true}
        action="update"
        onPermissionsLoaded={(fields) => console.log('Accessible fields:', fields)}
      />
    </DaaSProvider>
  );
}
```

**Action Types:**
- `create` - Filter by create permissions (default for new items)
- `update` - Filter by update permissions (default for existing items)
- `read` - Filter by read permissions (for read-only forms)

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
| `action` | `'create' \| 'update' \| 'read'` | auto | Form action for permission filtering |
| `enforcePermissions` | `boolean` | `false` | Enable permission-based field filtering |
| `onPermissionsLoaded` | `(fields: string[]) => void` | - | Callback when permissions are loaded |

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

- `@microbuild/ui-interfaces` - Individual interface components (40+ interfaces)
- `@microbuild/services` - API services for data fetching and DaaSProvider
- `@microbuild/types` - TypeScript type definitions
- `@microbuild/utils` - Shared utilities for field interface mapping, readonly detection, and validation
- `@microbuild/hooks` - Relation hooks used by relational interfaces

## Storybook Development

VForm has comprehensive Storybook documentation with DaaS integration.

### Running Storybook

```bash
# Start Storybook (mocked data stories work immediately)
pnpm storybook:form

# For DaaS Playground, also start the host app (in a separate terminal):
pnpm dev:host
```

### DaaS Playground

The "VForm DaaS Playground" story allows testing VForm with real collection schemas using the **storybook-host** Next.js app as an authentication proxy:

1. Start the host app: `pnpm dev:host`
2. Open `http://localhost:3000` and connect with your DaaS URL + static token
3. Start Storybook: `pnpm storybook:form`
4. Navigate to "Forms/VForm DaaS Playground" → "Playground"
5. Select a collection from the dropdown
6. Test VForm with real fields including relational interfaces (M2O, O2M, M2M, M2A)

All `/api/*` requests from Storybook are proxied through the host app, avoiding CORS issues in both development and production.

## Utility Integration

VForm uses `@microbuild/utils` for core functionality:

```tsx
import { 
  getFieldInterface,   // Maps field types to interface components
  isFieldReadOnly,     // Detects readonly fields (auto-increment, UUID PKs, etc.)
  getFieldDefault,     // Gets safe default values (filters DB-generated defaults)
  isPresentationField  // Identifies dividers, notices, etc.
} from '@microbuild/utils';
```

These utilities are also re-exported from `@microbuild/ui-form` for convenience.

## License

MIT
