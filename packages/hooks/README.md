# @microbuild/hooks

React hooks for Microbuild projects. Includes authentication and permission hooks following DaaS architecture, plus DaaS-compatible relation hooks for M2M, M2O, O2M, and M2A relationships.

## Installation

```bash
pnpm add @microbuild/hooks
```

## Peer Dependencies

- `@microbuild/types` workspace:*
- `@microbuild/services` workspace:*
- `react` ^18.0.0 || ^19.0.0

## Authentication Architecture

The hooks follow the DaaS (Data-as-a-Service) authentication architecture:

### Authentication Methods Supported

1. **Cookie-Based Sessions** - For browser requests (automatic)
2. **Static Tokens** - For programmatic access (DaaS-style)
3. **JWT Bearer Tokens** - For API clients with Supabase Auth

### DaaSProvider

Wrap your app with `DaaSProvider` to enable direct DaaS API access:

```tsx
import { DaaSProvider } from '@microbuild/hooks';

// In Storybook or testing environment
<DaaSProvider 
  config={{ 
    url: 'https://xxx.microbuild-daas.xtremax.com', 
    token: 'your-static-token' 
  }}
  onAuthenticated={(user) => console.log('Authenticated:', user)}
>
  <App />
</DaaSProvider>

// In Next.js app (uses proxy routes - no config needed)
<DaaSProvider>
  <App />
</DaaSProvider>
```

### useAuth Hook

Get authentication state and methods:

```tsx
import { useAuth } from '@microbuild/hooks';

function UserProfile() {
  const { 
    user, 
    isAdmin, 
    isAuthenticated, 
    loading, 
    error,
    refresh,
    checkPermission 
  } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <LoginButton />;

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      {isAdmin && <Badge>Admin</Badge>}
    </div>
  );
}
```

### usePermissions Hook

Check field-level and action-level permissions:

```tsx
import { usePermissions } from '@microbuild/hooks';

function ArticleEditor({ articleId }: { articleId: string }) {
  const { 
    canPerform, 
    getAccessibleFields, 
    isFieldAccessible,
    isAdmin,
    loading 
  } = usePermissions({ collections: ['articles'] });

  if (!canPerform('articles', 'update')) {
    return <Alert>You don't have permission to edit articles</Alert>;
  }

  const editableFields = getAccessibleFields('articles', 'update');
  
  return (
    <ArticleForm 
      fields={editableFields} 
      readonly={!isFieldAccessible('articles', 'update', 'title')}
    />
  );
}
```

## API Request Handling

All hooks use the centralized `apiRequest` from `@microbuild/services`, which automatically:
- Uses local `/api/*` routes in Next.js apps (proxy mode)
- Makes direct API calls with Bearer token in Storybook/testing (direct mode via `DaaSProvider`)

This means hooks work seamlessly in both environments without code changes.

## Relation Hooks

### useRelationM2M / useRelationM2MItems

Manage Many-to-Many relationships.

```typescript
import { useRelationM2M, useRelationM2MItems } from '@microbuild/hooks';

function ProductTags({ productId }: { productId: string }) {
  // Get relation info
  const { relationInfo, loading } = useRelationM2M('products', 'tags');
  
  // Manage items
  const { 
    items, 
    loadItems, 
    addItem, 
    removeItem, 
    reorderItems,
    loading: itemsLoading 
  } = useRelationM2MItems(relationInfo, productId);

  const handleAddTag = (tagId: string) => {
    addItem({ id: tagId });
  };

  return (
    <div>
      {items.map(tag => (
        <Chip key={tag.id} onRemove={() => removeItem(tag.id)}>
          {tag.name}
        </Chip>
      ))}
    </div>
  );
}
```

### useRelationM2O / useRelationM2OItem

Manage Many-to-One relationships.

```typescript
import { useRelationM2O, useRelationM2OItem } from '@microbuild/hooks';

function ArticleAuthor({ articleId }: { articleId: string }) {
  const { relationInfo } = useRelationM2O('articles', 'author');
  const { item: author, setItem, loading } = useRelationM2OItem(relationInfo, articleId);

  return (
    <Select
      value={author?.id}
      onChange={(authorId) => setItem(authorId)}
      data={/* authors list */}
    />
  );
}
```

### useRelationO2M / useRelationO2MItems

Manage One-to-Many relationships.

```typescript
import { useRelationO2M, useRelationO2MItems } from '@microbuild/hooks';

function AuthorArticles({ authorId }: { authorId: string }) {
  const { relationInfo } = useRelationO2M('users', 'articles');
  const { items: articles, createItem, deleteItem } = useRelationO2MItems(relationInfo, authorId);

  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
      <Button onClick={() => createItem({ title: 'New Article' })}>
        Add Article
      </Button>
    </div>
  );
}
```

### useRelationM2A / useRelationM2AItems

Manage Many-to-Any (polymorphic) relationships.

```typescript
import { useRelationM2A, useRelationM2AItems } from '@microbuild/hooks';

function PageBlocks({ pageId }: { pageId: string }) {
  const { relationInfo } = useRelationM2A('pages', 'blocks');
  const { items: blocks, addItem, removeItem } = useRelationM2AItems(relationInfo, pageId);

  // blocks can be from different collections (text_blocks, image_blocks, etc.)
  return (
    <div>
      {blocks.map(block => (
        <BlockRenderer key={block.id} block={block} collection={block.$collection} />
      ))}
    </div>
  );
}
```

## File Hooks

### useFiles

Manage file uploads and file selection with DaaS/DaaS Files API integration.

```typescript
import { useFiles, type DaaSFile } from '@microbuild/hooks';

function ImageUploader() {
  const { 
    uploadFiles,
    fetchFiles,
    importFromUrl,
  } = useFiles();

  const handleUpload = async (files: File[]) => {
    const uploadedFiles = await uploadFiles(files, {
      folder: 'product-images',
    });
    console.log('Uploaded:', uploadedFiles.map(f => f.id));
  };

  const handleBrowseLibrary = async () => {
    const { files, total } = await fetchFiles({
      page: 1,
      limit: 20,
      search: 'product',
    });
    return files;
  };

  const handleImportUrl = async (url: string) => {
    const file = await importFromUrl(url, { folder: 'imports' });
    return file;
  };

  return (
    <Dropzone onDrop={handleUpload}>
      Drop files here
    </Dropzone>
  );
}
```

### DaaSFile Type

The `DaaSFile` interface matches the DaaS API response:

```typescript
import { type DaaSFile } from '@microbuild/hooks';

// DaaSFile fields:
// - id: string
// - storage: string
// - filename_disk: string | null
// - filename_download: string
// - title: string | null
// - description: string | null
// - type: string | null (MIME type)
// - filesize: number
// - width: number | null (for images)
// - height: number | null (for images)
// - uploaded_on: string | null
// - uploaded_by: string | null
// - modified_on: string
// - folder: string | null
```

## Selection & Preset Hooks

### useSelection

Manage item selection state.

```typescript
import { useSelection } from '@microbuild/hooks';

function ProductList({ products }) {
  const { 
    selected, 
    isSelected, 
    toggle, 
    selectAll, 
    deselectAll, 
    allSelected 
  } = useSelection<string>();

  return (
    <div>
      <Checkbox checked={allSelected} onChange={selectAll} label="Select All" />
      {products.map(product => (
        <Checkbox
          key={product.id}
          checked={isSelected(product.id)}
          onChange={() => toggle(product.id)}
          label={product.title}
        />
      ))}
      <Button onClick={() => handleBulkDelete(selected)}>
        Delete {selected.length} items
      </Button>
    </div>
  );
}
```

### usePreset

Manage collection presets (filters, search, layout).

```typescript
import { usePreset } from '@microbuild/hooks';

function ProductFilters() {
  const { 
    filter, 
    setFilter, 
    search, 
    setSearch, 
    sort, 
    setSort,
    reset 
  } = usePreset('products');

  return (
    <div>
      <TextInput 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search..."
      />
      <Select
        value={filter.status}
        onChange={(status) => setFilter({ status: { _eq: status } })}
        data={['draft', 'published']}
      />
      <Button onClick={reset}>Reset Filters</Button>
    </div>
  );
}
```

## Navigation & State Hooks

### useEditsGuard / useHasEdits

Prevent navigation when there are unsaved changes.

```typescript
import { useEditsGuard, useHasEdits } from '@microbuild/hooks';

function EditForm({ initialData }) {
  const [data, setData] = useState(initialData);
  
  // Track if form has unsaved changes
  const hasEdits = useHasEdits(initialData, data);
  
  // Block navigation if unsaved changes
  useEditsGuard(hasEdits, {
    message: 'You have unsaved changes. Are you sure you want to leave?',
  });

  return (
    <form>
      {hasEdits && <Badge color="yellow">Unsaved changes</Badge>}
      {/* form fields */}
    </form>
  );
}
```

### useClipboard

Clipboard operations with notifications.

```typescript
import { useClipboard } from '@microbuild/hooks';

function CopyButton({ text }) {
  const { copy, copied } = useClipboard();

  return (
    <Button onClick={() => copy(text)} color={copied ? 'green' : 'blue'}>
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}
```

### useLocalStorage

Persistent localStorage state.

```typescript
import { useLocalStorage } from '@microbuild/hooks';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <Switch
      checked={theme === 'dark'}
      onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      label="Dark mode"
    />
  );
}
```

## Versioning & Workflow Hooks

### useVersions

Manage content versions.

```typescript
import { useVersions } from '@microbuild/hooks';

function VersionManager({ collection, itemId }) {
  const { 
    versions, 
    currentVersion,
    createVersion, 
    restoreVersion, 
    deleteVersion,
    loading 
  } = useVersions({ collection, itemId });

  return (
    <div>
      <Button onClick={() => createVersion('Draft v2')}>Save Version</Button>
      {versions.map(version => (
        <div key={version.id}>
          {version.name}
          <Button onClick={() => restoreVersion(version.id)}>Restore</Button>
        </div>
      ))}
    </div>
  );
}
```

### useWorkflowAssignment

Check if a collection has workflow assignment.

```typescript
import { useWorkflowAssignment } from '@microbuild/hooks';

function CollectionHeader({ collection }) {
  const { hasWorkflow, workflowId, loading } = useWorkflowAssignment(collection);

  return (
    <div>
      {hasWorkflow && <Badge>Workflow Enabled</Badge>}
    </div>
  );
}
```

### useWorkflowVersioning

Combined workflow + versioning integration.

```typescript
import { useWorkflowVersioning } from '@microbuild/hooks';

function ArticleEditor({ articleId }) {
  const {
    editMode,          // 'live' | 'draft' | 'version'
    currentState,      // workflow state
    canTransition,     // can move to next state
    transition,        // execute transition
    saveVersion,       // save current as version
    compareVersions,   // compare two versions
  } = useWorkflowVersioning({
    collection: 'articles',
    itemId: articleId,
  });

  return (
    <div>
      <Badge>{currentState}</Badge>
      {canTransition && (
        <Button onClick={() => transition('publish')}>Publish</Button>
      )}
    </div>
  );
}
```

## API Reference

### Relation Hooks

| Hook | Description |
|------|-------------|
| `useRelationM2M` | Get M2M relation info |
| `useRelationM2MItems` | Manage M2M items (add, remove, reorder) |
| `useRelationM2O` | Get M2O relation info |
| `useRelationM2OItem` | Get/set M2O related item |
| `useRelationO2M` | Get O2M relation info |
| `useRelationO2MItems` | Manage O2M items (create, delete) |
| `useRelationM2A` | Get M2A relation info |
| `useRelationM2AItems` | Manage M2A polymorphic items |

### Utility Hooks

| Hook | Description |
|------|-------------|
| `useFiles` | File upload and management |
| `useSelection` | Item selection state |
| `usePreset` | Collection presets (filter, search, sort) |
| `useEditsGuard` | Navigation guard for unsaved changes |
| `useHasEdits` | Check if data has changed |
| `useClipboard` | Clipboard copy with feedback |
| `useLocalStorage` | Persistent localStorage state |

### Versioning Hooks

| Hook | Description |
|------|-------------|
| `useVersions` | Content version management |
| `useWorkflowAssignment` | Check workflow assignment |
| `useWorkflowVersioning` | Combined workflow + versioning |

## Related Packages

- [@microbuild/types](../types) - TypeScript types for relations
- [@microbuild/services](../services) - Services used by hooks
- [@microbuild/ui-interfaces](../ui-interfaces) - UI components that use these hooks
