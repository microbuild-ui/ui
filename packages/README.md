# Microbuild UI Packages

A collection of packages for building DaaS-compatible content management applications with React and Mantine v8.

## Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@microbuild/types](./types) | TypeScript type definitions | [README](./types/README.md) |
| [@microbuild/services](./services) | CRUD service classes + DaaS context | [README](./services/README.md) |
| [@microbuild/hooks](./hooks) | React hooks for relations, selection, presets, workflows | [README](./hooks/README.md) |
| [@microbuild/utils](./utils) | Field interface mapper & utilities | [README](./utils/README.md) |
| [@microbuild/ui-interfaces](./ui-interfaces) | Field interface components (40+) | [README](./ui-interfaces/README.md) |
| [@microbuild/ui-form](./ui-form) | VForm dynamic form component | [README](./ui-form/README.md) |
| [@microbuild/ui-table](./ui-table) | VTable dynamic table component | [README](./ui-table/README.md) |
| [@microbuild/ui-collections](./ui-collections) | CollectionForm & CollectionList | [README](./ui-collections/README.md) |
| [@microbuild/cli](./cli) | CLI for copying components ([npm](https://www.npmjs.com/package/@microbuild/cli)) | [README](./cli/README.md) |
| [@microbuild/mcp](./mcp-server) | MCP server for AI agents ([npm](https://www.npmjs.com/package/@microbuild/mcp)) | [README](./mcp-server/README.md) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
├─────────────────────────────────────────────────────────────┤
│  ui-collections                                             │
│  (CollectionForm, CollectionList)                           │
│          ↓ uses                                             │
├─────────────────────────────────────────────────────────────┤
│  ui-form                    ui-table                        │
│  (VForm - dynamic form)     (VTable - dynamic table)        │
│          ↓ renders                                          │
├─────────────────────────────────────────────────────────────┤
│  ui-interfaces                                              │
│  (40+ Field Components: Input, Select, DateTime, M2M, etc.) │
├─────────────────────────────────────────────────────────────┤
│                         hooks                               │
│  (useRelationM2M, useSelection, usePreset, useVersions...)  │
├─────────────────────────────────────────────────────────────┤
│                     services + utils                        │
│  (ItemsService, FieldsService, DaaSProvider,                │
│   getFieldInterface, field-interface-mapper)                │
├─────────────────────────────────────────────────────────────┤
│                         types                               │
│        (TypeScript definitions for all entities)            │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### CLI Installation (Recommended - Copy & Own)

The CLI is published on npm. No local build required.

```bash
# Initialize in your project
npx @microbuild/cli@latest init

# Add components
npx @microbuild/cli@latest add input select-dropdown datetime

# List available components
npx @microbuild/cli@latest list
```

### Traditional Package Installation

```bash
pnpm add @microbuild/types @microbuild/services @microbuild/hooks
pnpm add @microbuild/ui-interfaces @microbuild/ui-collections
```

### Peer Dependencies

```bash
pnpm add @mantine/core @mantine/hooks @mantine/dates @tabler/icons-react react react-dom
```

## Usage Examples

### Using Services

```typescript
import { ItemsService } from '@microbuild/services';

const productsService = new ItemsService('products');
const products = await productsService.readByQuery({ 
  filter: { status: { _eq: 'published' } },
  limit: 10 
});
```

### Using Hooks

```typescript
import { useRelationM2M, useRelationM2MItems } from '@microbuild/hooks';

function ProductTags({ productId }) {
  const { relationInfo } = useRelationM2M('products', 'tags');
  const { items, addItem, removeItem } = useRelationM2MItems(relationInfo, productId);
  // ...
}
```

### Using UI Components

```tsx
import { Input, SelectDropdown, DateTime } from '@microbuild/ui-interfaces';
import { CollectionForm } from '@microbuild/ui-collections';

// Individual components
<Input field="title" value={title} onChange={setTitle} />
<SelectDropdown field="status" value={status} onChange={setStatus} choices={choices} />

// Dynamic form
<CollectionForm collection="products" mode="create" onSuccess={handleSuccess} />
```

## Distribution

Microbuild supports two distribution models:

1. **Copy & Own (CLI)** - Components are copied as source code to your project
2. **Package Installation** - Traditional npm package dependencies

See the root [QUICKSTART.md](../QUICKSTART.md) for detailed setup instructions.

## Related Documentation

- [QUICKSTART.md](../QUICKSTART.md) - MCP & CLI setup guide
- [docs/DISTRIBUTION.md](../docs/DISTRIBUTION.md) - Distribution methods
- [docs/PUBLISHING.md](../docs/PUBLISHING.md) - npm publishing & release workflow
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
