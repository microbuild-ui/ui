# @microbuild/ui-collections

Dynamic collection components for Microbuild projects. `CollectionForm` provides CRUD operations with data fetching, using `VForm` from `@microbuild/ui-form` for rendering all 40+ interface types. `CollectionList` displays collection items with pagination, search, and bulk actions.

## Architecture

```
CollectionForm (Data Layer)
    │
    ├── Fetches field definitions
    ├── Loads/saves item data
    ├── Handles CRUD operations
    │
    └──▶ VForm (Presentation Layer)
            │
            └──▶ ui-interfaces (40+ components)
                    ├── Input, Textarea, InputCode
                    ├── SelectDropdown, Tags, Color
                    ├── DateTime, Boolean, Toggle
                    ├── ListM2M, ListM2O, ListO2M
                    └── RichText, File, Map...
```

## Installation

```bash
pnpm add @microbuild/ui-collections
```

## Peer Dependencies

This package requires the following peer dependencies:

- `@mantine/core` ^8.0.0
- `@mantine/dates` ^8.0.0
- `@mantine/hooks` ^8.0.0
- `@microbuild/services` workspace:*
- `@microbuild/types` workspace:*
- `@microbuild/ui-form` workspace:*
- `@tabler/icons-react` ^3.0.0
- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0

## Usage

### CollectionForm

Dynamic form for creating/editing collection items:

```tsx
import { CollectionForm } from '@microbuild/ui-collections';

function CreateProduct() {
  return (
    <CollectionForm
      collection="products"
      mode="create"
      defaultValues={{ status: 'draft' }}
      onSuccess={(data) => console.log('Created:', data)}
      onCancel={() => console.log('Cancelled')}
      excludeFields={['internal_notes']}
    />
  );
}

function EditProduct({ productId }: { productId: string }) {
  return (
    <CollectionForm
      collection="products"
      id={productId}
      mode="edit"
      onSuccess={(data) => console.log('Updated:', data)}
    />
  );
}
```

### CollectionList

Dynamic list/table for displaying collection items:

```tsx
import { CollectionList } from '@microbuild/ui-collections';

function ProductList() {
  return (
    <CollectionList
      collection="products"
      enableSelection
      enableSearch
      fields={['name', 'status', 'price']}
      limit={25}
      filter={{ status: { _eq: 'published' } }}
      bulkActions={[
        {
          label: 'Delete',
          color: 'red',
          action: (ids) => handleBulkDelete(ids),
        },
      ]}
      onItemClick={(item) => router.push(`/products/${item.id}`)}
    />
  );
}
```

## API Reference

### CollectionFormProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collection` | `string` | required | Collection name |
| `id` | `string \| number` | - | Item ID for edit mode |
| `mode` | `'create' \| 'edit'` | `'create'` | Form mode |
| `defaultValues` | `Record<string, unknown>` | `{}` | Default values for new items |
| `onSuccess` | `(data?: Record<string, unknown>) => void` | - | Callback on successful save |
| `onCancel` | `() => void` | - | Callback on cancel |
| `excludeFields` | `string[]` | `[]` | Fields to exclude from form |
| `includeFields` | `string[]` | - | Fields to show (exclusive) |

### CollectionListProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collection` | `string` | required | Collection name to display |
| `enableSelection` | `boolean` | `false` | Enable row selection |
| `filter` | `Record<string, unknown>` | - | Filter to apply |
| `bulkActions` | `BulkAction[]` | `[]` | Bulk actions for selected items |
| `fields` | `string[]` | - | Fields to display (defaults to first 4 fields) |
| `limit` | `number` | `15` | Items per page |
| `enableSearch` | `boolean` | `true` | Enable search |
| `primaryKeyField` | `string` | `'id'` | Primary key field name |
| `onItemClick` | `(item: AnyItem) => void` | - | Callback when item is clicked |

### BulkAction

```typescript
interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  action: (selectedIds: (string | number)[]) => void | Promise<void>;
}
```

## Features

### CollectionForm Features

- **Auto-field Detection**: Automatically fetches field definitions from the API
- **VForm Integration**: Uses VForm for rendering, supporting all 40+ interface types:
  - Text fields → Input, Textarea, InputCode, RichText
  - Selection fields → SelectDropdown, SelectRadio, Tags, Color
  - Boolean fields → Toggle, Boolean
  - Date/DateTime fields → DateTime picker
  - Relational fields → ListM2M, ListM2O, ListO2M, ListM2A
  - Media fields → File, FileImage, Files, Upload
  - Layout fields → Divider, Notice, GroupDetail
- **System Field Handling**: Auto-excludes system fields (id, user_created, etc.)
- **Edit Mode**: Load existing item data when editing
- **Validation**: Built-in required field validation with error display
- **Loading States**: Shows loading overlay while fetching data
- **Error Handling**: Displays error messages on failure

### CollectionList Features

- **Dynamic Columns**: Auto-detects displayable fields
- **Pagination**: Built-in pagination with configurable page size
- **Search**: Full-text search across items
- **Row Selection**: Checkbox selection with select-all
- **Bulk Actions**: Configurable bulk action buttons
- **Filtering**: Apply custom filters to the query
- **Click Handling**: Row click callback for navigation
- **Loading States**: Shows loading overlay while fetching
- **Error Handling**: Displays error messages on failure

## Architecture

This package follows Directus's v-form pattern:

| Directus | Microbuild |
|----------|------------|
| `v-form` component | `CollectionForm` |
| `form-field.vue` | Inline field rendering |
| `v-list` component | `CollectionList` |

The components use:
- `@microbuild/services` for API calls (`FieldsService`, `ItemsService`)
- `@microbuild/types` for type definitions (`Field`, `AnyItem`)
- Mantine v8 for UI components
