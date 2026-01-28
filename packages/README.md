# Microbuild UI Packages

A collection of packages for building Directus-compatible content management applications with React and Mantine v8.

## Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@microbuild/types](./types) | TypeScript type definitions | [README](./types/README.md) |
| [@microbuild/services](./services) | CRUD service classes | [README](./services/README.md) |
| [@microbuild/hooks](./hooks) | React hooks for relations & UI state | [README](./hooks/README.md) |
| [@microbuild/utils](./utils) | Field interface mapper & utilities | [README](./utils/README.md) |
| [@microbuild/ui-interfaces](./ui-interfaces) | Field interface components (40+) | [README](./ui-interfaces/README.md) |
| [@microbuild/ui-collections](./ui-collections) | CollectionForm & CollectionList | [README](./ui-collections/README.md) |
| [@microbuild/cli](./cli) | CLI for copying components | [README](./cli/README.md) |
| [@microbuild/mcp-server](./mcp-server) | MCP server for AI agents | [README](./mcp-server/README.md) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
├─────────────────────────────┬───────────────────────────────┤
│  ui-collections             │   ui-interfaces               │
│  (CollectionForm, List)     │   (Field Components)          │
├─────────────────────────────┴───────────────────────────────┤
│                         hooks                               │
│        (useRelationM2M, useRelationM2O, useFiles, etc.)     │
├─────────────────────────────────────────────────────────────┤
│                        services                             │
│        (ItemsService, FieldsService, CollectionsService)    │
├─────────────────────────────────────────────────────────────┤
│                         types                               │
│        (TypeScript definitions for all entities)            │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### CLI Installation (Recommended - Copy & Own)

```bash
# Initialize in your project
npx @microbuild/cli init

# Add components
npx @microbuild/cli add input select-dropdown datetime

# List available components
npx @microbuild/cli list
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
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
