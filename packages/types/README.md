# @microbuild/types

Shared TypeScript type definitions for Microbuild projects. Directus-compatible types for collections, fields, files, and relations.

## Installation

```bash
pnpm add @microbuild/types
```

## Usage

```typescript
import type { 
  Field, 
  Collection, 
  Query, 
  Filter,
  PrimaryKey,
  DirectusFile,
  M2MRelationInfo 
} from '@microbuild/types';
```

## Core Types

### Query & Filter

```typescript
import type { Query, Filter, PrimaryKey, AnyItem } from '@microbuild/types';

// Type-safe query building
const query: Query = {
  fields: ['id', 'title', 'status'],
  filter: { status: { _eq: 'published' } },
  sort: ['-created_at'],
  limit: 10,
};

// Complex filters
const filter: Filter = {
  _and: [
    { status: { _eq: 'published' } },
    { _or: [
      { featured: { _eq: true } },
      { priority: { _gte: 5 } }
    ]}
  ]
};
```

### Collections & Fields

```typescript
import type { Collection, CollectionMeta, Field, FieldMeta, FieldSchema } from '@microbuild/types';

// Collection with metadata
const collection: Collection = {
  collection: 'products',
  meta: {
    collection: 'products',
    icon: 'shopping_cart',
    display_template: '{{title}}',
    versioning: true,
  },
  schema: { name: 'products' },
};

// Field definition
const field: Field = {
  collection: 'products',
  field: 'title',
  type: 'string',
  schema: {
    name: 'title',
    table: 'products',
    data_type: 'varchar',
    max_length: 255,
    is_nullable: false,
    is_unique: false,
    is_primary_key: false,
    has_auto_increment: false,
  },
  meta: {
    id: 1,
    collection: 'products',
    field: 'title',
    interface: 'input',
    readonly: false,
    hidden: false,
    required: true,
    width: 'full',
  },
};
```

### Permissions

```typescript
import type { Permission, PermissionAction } from '@microbuild/types';

const permission: Permission = {
  id: '1',
  role: 'editor',
  collection: 'articles',
  action: 'update',
  fields: ['title', 'content', 'status'],
  permissions: { author: { _eq: '$CURRENT_USER' } },
};
```

## File Types

```typescript
import type { DirectusFile, FileUpload, Folder } from '@microbuild/types';
import { getFileCategory, formatFileSize, getAssetUrl } from '@microbuild/types';

// File metadata
const file: DirectusFile = {
  id: 'abc-123',
  storage: 'local',
  filename_disk: 'image.jpg',
  filename_download: 'product-image.jpg',
  title: 'Product Image',
  type: 'image/jpeg',
  filesize: 1024000,
  width: 1920,
  height: 1080,
};

// Utility functions
getFileCategory('image/jpeg');        // 'image'
formatFileSize(1024000);              // '1 MB'
getAssetUrl('abc-123');               // '/assets/abc-123'
getAssetUrl('abc-123', { width: 200 }); // '/assets/abc-123?width=200'
```

## Relation Types

```typescript
import type { 
  Relation,
  M2MRelationInfo, 
  M2ORelationInfo, 
  O2MRelationInfo,
  M2ARelationInfo 
} from '@microbuild/types';

// Many-to-Many: Articles <-> Tags (through article_tags)
const m2mInfo: M2MRelationInfo = {
  junctionCollection: { collection: 'article_tags' },
  relatedCollection: { collection: 'tags' },
  junctionField: { field: 'article_id', type: 'uuid' },
  relatedPrimaryKeyField: { field: 'id', type: 'uuid' },
  sortField: 'sort',
};

// Many-to-One: Articles -> Author
const m2oInfo: M2ORelationInfo = {
  relatedCollection: { collection: 'users' },
  relatedPrimaryKeyField: { field: 'id', type: 'uuid' },
};

// One-to-Many: Author -> Articles
const o2mInfo: O2MRelationInfo = {
  relatedCollection: { collection: 'articles' },
  relatedPrimaryKeyField: { field: 'id', type: 'uuid' },
  reverseJunctionField: { field: 'author_id', type: 'uuid' },
};
```

## API Reference

### Core Types

| Type | Description |
|------|-------------|
| `PrimaryKey` | `string \| number` - Item identifier |
| `AnyItem` | `Record<string, unknown>` - Generic item |
| `Query` | Query parameters (fields, filter, sort, limit, etc.) |
| `Filter` | Filter operators for querying |
| `Collection` | Collection definition with meta and schema |
| `CollectionMeta` | Collection metadata (icon, display_template, etc.) |
| `Field` | Field definition with schema and meta |
| `FieldMeta` | Field metadata (interface, options, validation, etc.) |
| `FieldSchema` | Database column schema info |
| `Permission` | Permission definition for RBAC |
| `PermissionAction` | `'create' \| 'read' \| 'update' \| 'delete' \| 'share'` |

### File Types

| Type | Description |
|------|-------------|
| `DirectusFile` | File entity with metadata |
| `FileUpload` | File upload payload |
| `Folder` | Folder entity |

### Relation Types

| Type | Description |
|------|-------------|
| `Relation` | Base relation definition |
| `M2MRelationInfo` | Many-to-Many relationship info |
| `M2ORelationInfo` | Many-to-One relationship info |
| `O2MRelationInfo` | One-to-Many relationship info |
| `M2ARelationInfo` | Many-to-Any (polymorphic) relationship info |

## Related Packages

- [@microbuild/services](../services) - CRUD services using these types
- [@microbuild/hooks](../hooks) - React hooks for relations
- [@microbuild/ui-interfaces](../ui-interfaces) - Field interface components
