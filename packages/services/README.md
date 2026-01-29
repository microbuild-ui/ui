# @microbuild/services

CRUD service classes for Microbuild projects. Directus-compatible services for items, fields, collections, and permissions.

## Installation

```bash
pnpm add @microbuild/services
```

## Peer Dependencies

- `@microbuild/types` workspace:*

## Usage

```typescript
import { 
  ItemsService, 
  FieldsService, 
  CollectionsService, 
  PermissionsService 
} from '@microbuild/services';
```

## ItemsService

Generic CRUD service for any collection.

```typescript
import { ItemsService } from '@microbuild/services';

// Create a typed service
interface Product {
  id: string;
  title: string;
  price: number;
  status: 'draft' | 'published';
}

const productsService = new ItemsService<Product>('products');

// Read operations
const products = await productsService.readByQuery({ 
  filter: { status: { _eq: 'published' } },
  sort: ['-created_at'],
  limit: 10 
});

const product = await productsService.readOne('product-id');

// Create
const newProduct = await productsService.createOne({ 
  title: 'New Product', 
  price: 99.99,
  status: 'draft' 
});

// Update
await productsService.updateOne('product-id', { 
  title: 'Updated Title' 
});

// Bulk update
await productsService.updateMany(['id-1', 'id-2'], { 
  status: 'published' 
});

// Delete
await productsService.deleteOne('product-id');
await productsService.deleteMany(['id-1', 'id-2']);
```

### Factory Function

```typescript
import { createItemsService } from '@microbuild/services';

// Alternative creation with custom API endpoint
const service = createItemsService<Product>('products', {
  baseUrl: '/api/v2',
});
```

## FieldsService

Read field definitions for collections.

```typescript
import { FieldsService } from '@microbuild/services';

const fieldsService = new FieldsService();

// Get all fields for a collection
const fields = await fieldsService.readAll('products');

// Get a specific field
const field = await fieldsService.readOne('products', 'title');

// Get fields with specific interface
const inputFields = fields.filter(f => f.meta?.interface === 'input');
```

## CollectionsService

Read collection metadata.

```typescript
import { CollectionsService } from '@microbuild/services';

const collectionsService = new CollectionsService();

// Get all collections
const collections = await collectionsService.readAll();

// Get a specific collection
const products = await collectionsService.readOne('products');

// Check if collection exists
const exists = await collectionsService.exists('products');
```

## PermissionsService

Get field-level permissions for the current user.

```typescript
import { PermissionsService, type FieldPermissions } from '@microbuild/services';

const permissionsService = new PermissionsService();

// Get permissions for a collection and action
const permissions: FieldPermissions = await permissionsService.getFieldPermissions(
  'products', 
  'update'
);

// Check if user can edit a field
if (permissions.title) {
  // User can edit title field
}

// Get all readable fields
const readableFields = await permissionsService.getFieldPermissions('products', 'read');
```

## API Request

Low-level API request function used by all services. Supports both proxy mode (Next.js) and direct DaaS mode (Storybook/testing).

```typescript
import { apiRequest } from '@microbuild/services';

// GET request
const data = await apiRequest<Product[]>('/api/items/products');

// POST request
const created = await apiRequest<Product>('/api/items/products', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Product' }),
});

// With query parameters
const filtered = await apiRequest<{ data: Product[] }>('/api/items/products?limit=10');
```

## DaaS Context Provider

For environments without Next.js API routes (like Storybook), use `DaaSProvider` to enable direct DaaS API access.

```typescript
import { DaaSProvider, setGlobalDaaSConfig } from '@microbuild/services';

// React context approach (recommended)
<DaaSProvider config={{ url: 'https://xxx.microbuild-daas.xtremax.com', token: 'your-token' }}>
  <VForm collection="articles" />
</DaaSProvider>

// Global config for non-React contexts
setGlobalDaaSConfig({ 
  url: 'https://xxx.microbuild-daas.xtremax.com', 
  token: 'your-token' 
});
```

### DaaS Configuration Exports

| Export | Description |
|--------|-------------|
| `DaaSProvider` | React provider for direct DaaS API access |
| `useDaaSContext` | Hook to access DaaS configuration |
| `useIsDirectDaaSMode` | Hook to check if direct mode is enabled |
| `setGlobalDaaSConfig` | Set global config for non-React contexts |
| `getGlobalDaaSConfig` | Get current global config |
| `buildApiUrl` | Build URL respecting DaaS config |
| `getApiHeaders` | Get headers with auth token |

### Proxy Mode vs Direct Mode

| Mode | Use Case | How it works |
|------|----------|--------------|
| **Proxy Mode** | Next.js apps | Requests go to `/api/*` routes, server proxies to DaaS |
| **Direct Mode** | Storybook, tests | Requests go directly to DaaS URL with Bearer token |

The `apiRequest` function automatically handles both modes based on the DaaS configuration.

## API Reference

### ItemsService<T>

| Method | Description |
|--------|-------------|
| `readByQuery(query)` | Read items with filter, sort, pagination |
| `readOne(id)` | Read single item by ID |
| `createOne(data)` | Create single item |
| `createMany(data[])` | Create multiple items |
| `updateOne(id, data)` | Update single item |
| `updateMany(ids[], data)` | Update multiple items |
| `deleteOne(id)` | Delete single item |
| `deleteMany(ids[])` | Delete multiple items |

### FieldsService

| Method | Description |
|--------|-------------|
| `readAll(collection)` | Get all fields for a collection |
| `readOne(collection, field)` | Get a specific field |

### CollectionsService

| Method | Description |
|--------|-------------|
| `readAll()` | Get all collections |
| `readOne(collection)` | Get a specific collection |
| `exists(collection)` | Check if collection exists |

### PermissionsService

| Method | Description |
|--------|-------------|
| `getFieldPermissions(collection, action)` | Get field permissions for action |

## Related Packages

- [@microbuild/types](../types) - TypeScript types used by services
- [@microbuild/hooks](../hooks) - React hooks that use these services
