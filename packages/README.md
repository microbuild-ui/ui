# Microbuild Packages

A modular monorepo of shared packages for building Directus-compatible content management applications with React and Mantine v8.

## Overview

Microbuild provides a complete toolkit for building headless CMS frontends that work seamlessly with Directus-style backends. The packages are designed to work together while remaining independently usable.

## Packages

| Package | Description |
|---------|-------------|
| [@microbuild/types](./types) | TypeScript type definitions for collections, fields, files, and relations |
| [@microbuild/services](./services) | CRUD service classes for items, fields, and collections |
| [@microbuild/hooks](./hooks) | React hooks for managing relational data (M2M, M2O, O2M, M2A) |
| [@microbuild/ui-interfaces](./ui-interfaces) | Field interface components (inputs, selects, file uploads, etc.) |
| [@microbuild/ui-collections](./ui-collections) | Dynamic collection components (CollectionForm, CollectionList) |
| [@microbuild/mcp-server](./mcp-server) | Model Context Protocol server for AI agents (Claude Desktop) |
| [@microbuild/cli](./cli) | CLI tool for copying components to projects (like shadcn/ui) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
├─────────────────────────────────────────────────────────────┤
│  @microbuild/ui-collections   │   @microbuild/ui-interfaces │
│  (CollectionForm, List)       │   (Field Components)        │
├───────────────────────────────┴─────────────────────────────┤
│                     @microbuild/hooks                       │
│        (useRelationM2M, useRelationM2O, useFiles, etc.)     │
├─────────────────────────────────────────────────────────────┤
│                    @microbuild/services                     │
│        (ItemsService, FieldsService, CollectionsService)    │
├─────────────────────────────────────────────────────────────┤
│                     @microbuild/types                       │
│        (TypeScript definitions for all entities)            │
└─────────────────────────────────────────────────────────────┘
```

## Installation

Using pnpm (recommended):

```bash
# Install individual packages
pnpm add @microbuild/types
pnpm add @microbuild/services
pnpm add @microbuild/hooks
pnpm add @microbuild/ui-interfaces
pnpm add @microbuild/ui-collections
```

### Peer Dependencies

The UI packages require the following peer dependencies:

```bash
pnpm add @mantine/core @mantine/hooks @mantine/dates @mantine/notifications @tabler/icons-react react react-dom
```

## Quick Start

### 1. Set Up Types

```typescript
import type { Field, Collection, Query } from '@microbuild/types';

// Type-safe query building
const query: Query = {
  fields: ['id', 'title', 'status'],
  filter: { status: { _eq: 'published' } },
  sort: ['-created_at'],
  limit: 10,
};
```

### 2. Create Services

```typescript
import { ItemsService, FieldsService } from '@microbuild/services';

// Create a typed items service
const productsService = new ItemsService<Product>('products');

// CRUD operations
const products = await productsService.readByQuery({ limit: 10 });
const product = await productsService.readOne('product-id');
const newProduct = await productsService.createOne({ title: 'New Product' });
await productsService.updateOne('product-id', { title: 'Updated' });
await productsService.deleteOne('product-id');
```

### 3. Use Relation Hooks

```typescript
import { useRelationM2M, useRelationM2O, useRelationO2M } from '@microbuild/hooks';

function ProductCategories({ productId }: { productId: string }) {
  const { items, addItem, removeItem, loading } = useRelationM2M({
    collection: 'products',
    field: 'categories',
    primaryKey: productId,
  });

  return (
    <div>
      {items.map(category => (
        <Chip key={category.id} onRemove={() => removeItem(category.id)}>
          {category.name}
        </Chip>
      ))}
    </div>
  );
}
```

### 4. Build Forms with UI Interfaces

```typescript
import { Input, SelectDropdown, DateTime, Toggle, FileImage } from '@microbuild/ui-interfaces';

function ProductForm() {
  const [values, setValues] = useState({});

  return (
    <form>
      <Input
        field="title"
        value={values.title}
        onChange={(val) => setValues({ ...values, title: val })}
        placeholder="Product title"
      />
      
      <SelectDropdown
        field="status"
        value={values.status}
        onChange={(val) => setValues({ ...values, status: val })}
        choices={[
          { text: 'Draft', value: 'draft' },
          { text: 'Published', value: 'published' },
        ]}
      />
      
      <DateTime
        field="publish_date"
        value={values.publish_date}
        onChange={(val) => setValues({ ...values, publish_date: val })}
        type="datetime"
      />
      
      <Toggle
        field="featured"
        value={values.featured}
        onChange={(val) => setValues({ ...values, featured: val })}
        label="Featured product"
      />
    </form>
  );
}
```

### 5. Use Dynamic Collection Components

```typescript
import { CollectionForm, CollectionList } from '@microbuild/ui-collections';

// Dynamic form that auto-fetches field definitions
function ProductEditor({ productId }: { productId?: string }) {
  return (
    <CollectionForm
      collection="products"
      id={productId}
      mode={productId ? 'edit' : 'create'}
      onSuccess={(data) => console.log('Saved:', data)}
      excludeFields={['internal_notes']}
    />
  );
}

// Dynamic list with automatic field rendering
function ProductList() {
  return (
    <CollectionList
      collection="products"
      fields={['title', 'status', 'price', 'created_at']}
      onRowClick={(item) => console.log('Selected:', item)}
    />
  );
}
```

## Package Details

### @microbuild/types

Core TypeScript definitions including:

- `Field`, `FieldMeta`, `FieldSchema` - Field definitions
- `Collection`, `CollectionMeta` - Collection metadata
- `Query`, `Filter` - Query building types
- `Relation`, `RelationMeta` - Relation definitions
- `DirectusFile` - File type definitions
- `PrimaryKey`, `AnyItem` - Utility types

### @microbuild/services

Service classes for API interactions:

- `ItemsService` - CRUD operations for collection items
- `FieldsService` - Fetch and manage field definitions
- `CollectionsService` - Fetch and manage collection metadata
- `apiRequest` - Low-level API request utility

### @microbuild/hooks

React hooks for data management:

- `useRelationM2M` - Many-to-Many relationships
- `useRelationM2MItems` - M2M item queries
- `useRelationM2O` - Many-to-One relationships
- `useRelationO2M` - One-to-Many relationships
- `useRelationM2A` - Many-to-Any relationships
- `useFiles` - File uploads and management
- `api` / `directusAPI` - API helpers

### @microbuild/ui-interfaces

Field interface components (Mantine v8):

**Input Components:**
- `Input` - Text input with validation
- `Textarea` - Multi-line text
- `InputCode` - Code editor with syntax highlighting
- `Tags` - Tag input

**Selection Components:**
- `SelectDropdown` - Dropdown select
- `SelectRadio` - Radio button group
- `SelectMultipleCheckbox` - Checkbox group
- `SelectIcon` - Icon picker
- `AutocompleteAPI` - API-powered autocomplete
- `CollectionItemDropdown` - Collection item selector

**Date/Time:**
- `DateTime` - Date, time, and datetime picker

**Boolean:**
- `Boolean` - Checkbox
- `Toggle` - Switch toggle

**Media:**
- `FileInterface` - Single file upload
- `Upload` - Multi-file upload
- `Color` - Color picker

**Relational:**
- `ListM2M` - Many-to-Many interface
- `ListM2O` - Many-to-One interface
- `ListO2M` - One-to-Many interface
- `ListM2A` - Many-to-Any interface

**Layout:**
- `Divider` - Section divider
- `Notice` - Alert/notice display
- `GroupDetail` - Collapsible group
- `Slider` - Range slider

### @microbuild/ui-collections

High-level collection components:

- `CollectionForm` - Dynamic form based on field definitions
- `CollectionList` - Dynamic data table/list

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/microbuild.git
cd microbuild/packages

# Install dependencies
pnpm install

# Type check all packages
pnpm -r typecheck

# Build packages
pnpm -r build
```

### Scripts

Each package supports the following scripts:

```bash
pnpm typecheck  # Run TypeScript type checking
pnpm build      # Build the package (ui-collections, ui-interfaces)
pnpm dev        # Watch mode build
pnpm clean      # Clean build artifacts
```

### Storybook

The `@microbuild/ui-interfaces` package includes a Storybook for interactive component development and documentation.

```bash
# Navigate to ui-interfaces package
cd ui-interfaces

# Start Storybook dev server on port 6006
pnpm storybook
```

Then open [http://localhost:6006](http://localhost:6006) to browse the component library.

Storybook stories are included for most interface components:
- Boolean, Toggle, Color
- SelectDropdown, SelectMultipleCheckbox
- File, FileImage
- ListM2M, ListM2O, ListO2M
- GroupDetail, Map
- And more...

## Directus Compatibility

These packages are designed to be compatible with [Directus](https://directus.io/) APIs and data structures. They can be used with:

- Directus Cloud or self-hosted instances
- Custom backends that follow Directus API conventions
- Any REST API with similar data structures

## Tech Stack

- **TypeScript** - Full type safety
- **React 18/19** - UI framework
- **Mantine v8** - Component library
- **Tabler Icons** - Icon set
- **pnpm** - Package manager with workspace support

## License

MIT License - see individual packages for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checks: `pnpm -r typecheck`
5. Submit a pull request
