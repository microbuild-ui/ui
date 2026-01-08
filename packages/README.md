# Microbuild UI Packages

Microbuild UI Packages is a set of beautifully-designed, accessible components and a code distribution platform for building Directus-compatible content management applications. Works with React 18/19, Mantine v8, and AI models. **Open Source. Open Code.**

This is not a component library. It is how you build your component library.

## Philosophy

Microbuild is built around the following principles:

- **Open Code**: The component code is yours to modify and extend
- **Composition**: Every component uses a common, composable interface
- **Distribution**: A flat-file schema and CLI make it easy to distribute components
- **AI-Ready**: Open code for LLMs to read, understand, and improve

### Open Code

Microbuild hands you the actual component code. You have full control to customize and extend:

- **Full Transparency**: You see exactly how each component is built
- **Easy Customization**: Modify any part of a component to fit your requirements
- **AI Integration**: Access to the code makes it straightforward for LLMs to understand and improve your components

In a typical library, if you need to change a component's behavior, you have to override styles or wrap the component. With Microbuild, you simply edit the code directly.

### Distribution

Microbuild is also a code distribution system. It defines a schema for components and a CLI to distribute them:

- **Schema**: A flat-file structure (`registry.json`) that defines the components, their dependencies, and properties
- **CLI**: A command-line tool to distribute and install components with import transformation

## Quick Start

```bash
# 1. Initialize in your project
npx @microbuild/cli init

# 2. Add components you need
npx @microbuild/cli add input select-dropdown datetime

# 3. Use in your code
import { Input } from '@/components/ui/input'
```

## Packages

| Package | Description |
|---------|-------------|
| [@microbuild/cli](./cli) | CLI tool for copying components to projects |
| [@microbuild/types](./types) | TypeScript type definitions for collections, fields, files, and relations |
| [@microbuild/services](./services) | CRUD service classes for items, fields, and collections |
| [@microbuild/hooks](./hooks) | React hooks for managing relational data (M2M, M2O, O2M, M2A) |
| [@microbuild/ui-interfaces](./ui-interfaces) | Field interface components (inputs, selects, file uploads, etc.) |
| [@microbuild/ui-collections](./ui-collections) | Dynamic collection components (CollectionForm, CollectionList) |
| [@microbuild/mcp-server](./mcp-server) | Model Context Protocol server for AI agents (VS Code Copilot) |

## Architecture (Copy & Own)

### Package Layers

The packages are designed in layers, where higher-level packages depend on lower-level ones:

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
├─────────────────────────────────────────────────────────────┤
│  ui-collections               │   ui-interfaces             │
│  (CollectionForm, List)       │   (Field Components)        │
│  → @/components/ui/           │   → @/components/ui/        │
├───────────────────────────────┴─────────────────────────────┤
│                         hooks                               │
│        (useRelationM2M, useRelationM2O, useFiles, etc.)     │
│                  → @/lib/microbuild/hooks/                  │
├─────────────────────────────────────────────────────────────┤
│                        services                             │
│        (ItemsService, FieldsService, CollectionsService)    │
│                → @/lib/microbuild/services/                 │
├─────────────────────────────────────────────────────────────┤
│                         types                               │
│        (TypeScript definitions for all entities)            │
│                 → @/lib/microbuild/types/                   │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure After Installation

When you add components, they're copied to your project with this structure:

```
your-project/
├── src/
│   ├── components/
│   │   └── ui/                      # Copied UI components
│   │       ├── input.tsx
│   │       ├── select-dropdown.tsx
│   │       ├── datetime.tsx
│   │       └── ...
│   └── lib/
│       └── microbuild/              # Copied lib modules
│           ├── utils.ts             # Utility functions (cn, etc.)
│           ├── types/               # TypeScript types
│           │   ├── core.ts
│           │   ├── file.ts
│           │   └── relations.ts
│           ├── services/            # CRUD services
│           │   ├── items.ts
│           │   ├── fields.ts
│           │   └── collections.ts
│           └── hooks/               # React hooks
│               ├── useRelationM2M.ts
│               ├── useRelationM2O.ts
│               └── ...
└── microbuild.json                  # Tracks installed components
```

## Installation

### CLI (Recommended - Copy & Own)

```bash
# Initialize Microbuild in your project
npx @microbuild/cli init

# Add specific components
npx @microbuild/cli add input select-dropdown toggle

# Add all components in a category
npx @microbuild/cli add --category selection

# Add all components
npx @microbuild/cli add --all

# List available components
npx @microbuild/cli list
```

### Traditional Package Installation (Alternative)

If you prefer the traditional package model:

```bash
pnpm add @microbuild/types @microbuild/services @microbuild/hooks
pnpm add @microbuild/ui-interfaces @microbuild/ui-collections
```

### Peer Dependencies

The UI components require:

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
