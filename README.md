# Microbuild Workspace

A pnpm workspace containing shared components and multiple Next.js applications.

## 🏗️ Structure

```
Microbuild/
├── pnpm-workspace.yaml     # Workspace configuration
├── package.json            # Root scripts
├── packages/
│   ├── ui-interfaces/      # Field interface components (@microbuild/ui-interfaces)
│   ├── ui-collections/     # Collection Form & List (@microbuild/ui-collections)
│   ├── types/              # Shared TypeScript types (@microbuild/types)
│   ├── services/           # Shared service classes (@microbuild/services)
│   └── hooks/              # Shared React hooks (@microbuild/hooks)
├── main-nextjs/            # Main Next.js CMS (template project)
└── nextjs-supabase-daas/   # DaaS Platform
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Setup

```bash
# Clone both repositories into this workspace
# (or use git submodules)

# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Or build individual projects
pnpm --filter main-nextjs build
pnpm --filter nextjs-supabase-daas build
```

### Development

```bash
# Run all projects in dev mode (parallel)
pnpm dev

# Run specific project
pnpm --filter main-nextjs dev
pnpm --filter nextjs-supabase-daas dev

# Run Storybook for UI component development
pnpm --filter @microbuild/ui-interfaces storybook

# Build shared packages first
pnpm --filter './packages/**' build
```

## 📦 Shared Packages

### @microbuild/types

Shared TypeScript type definitions following Directus conventions.

**Key Types:**
- `PrimaryKey`, `AnyItem`, `Filter`, `Query` - Core data types
- `Field`, `FieldMeta`, `Collection`, `CollectionMeta` - Schema types
- `DirectusFile`, `FileUpload`, `Folder` - File system types
- `M2MRelationInfo`, `M2ORelationInfo`, `O2MRelationInfo` - Relation types
- `Permission`, `Accountability` - Access control types

**Usage:**
```tsx
import type { Field, Collection, Query, PrimaryKey } from '@microbuild/types';
import { getFileCategory, formatFileSize, getAssetUrl } from '@microbuild/types';
```

### @microbuild/services

Service classes for CRUD operations on Directus collections.

**Available Services:**
- `ItemsService` - Generic CRUD for any collection
- `FieldsService` - Read field definitions
- `CollectionsService` - Read collection metadata

**Usage:**
```tsx
import { ItemsService, FieldsService } from '@microbuild/services';

const itemsService = new ItemsService('products');
const items = await itemsService.readByQuery({ filter: { status: { _eq: 'published' } } });

const fieldsService = new FieldsService();
const fields = await fieldsService.readAll('products');
```

### @microbuild/hooks

React hooks for managing Directus relationships.

**Available Hooks:**
- `useRelationM2M` / `useRelationM2MItems` - Many-to-Many relationships
- `useRelationM2O` / `useRelationM2OItem` - Many-to-One relationships  
- `useRelationO2M` / `useRelationO2MItems` - One-to-Many relationships

**Usage:**
```tsx
import { useRelationM2M, useRelationM2MItems } from '@microbuild/hooks';

function ProductTags({ productId }: { productId: string }) {
  const { relationInfo, loading } = useRelationM2M('products', 'tags');
  const { items, loadItems, selectItems } = useRelationM2MItems(relationInfo, productId);
  
  // Manage M2M relationships...
}
```

### @microbuild/ui-interfaces

Directus-compatible field interface components built with Mantine v8.

**Core Components:**
| Component | Description |
|-----------|-------------|
| `Boolean` | Switch toggle |
| `Toggle` | Enhanced toggle with icons and state labels |
| `DateTime` | Date/time picker |
| `Input` | Single-line text input |
| `Textarea` | Multi-line text input |
| `InputCode` | Monospace code editor with line numbers |

**Selection Components:**
| Component | Description |
|-----------|-------------|
| `SelectDropdown` | Dropdown select with search |
| `SelectRadio` | Radio button selection |
| `SelectMultipleCheckbox` | Checkbox group with "other" option |
| `SelectIcon` | Icon picker with categorized Material icons |
| `Tags` | Tag input with presets and custom tags |
| `AutocompleteAPI` | External API-backed autocomplete |
| `CollectionItemDropdown` | Collection item selector dropdown |

**Display Components:**
| Component | Description |
|-----------|-------------|
| `Color` | Color picker with RGB/HSL support, presets, opacity |
| `Divider` | Horizontal/vertical divider with title support |
| `Notice` | Alert/notice component (info, success, warning, danger) |
| `Slider` | Range slider with numeric type support |
| `GroupDetail` | Collapsible form section |

**Rich Text Components:**
| Component | Description |
|-----------|-------------|
| `InputBlockEditor` | Block-based content editor |
| `RichTextHtml` | WYSIWYG HTML editor with TipTap |
| `RichTextMarkdown` | Markdown editor with live preview |

**File & Media Components:**
| Component | Description |
|-----------|-------------|
| `FileInterface` | Single file upload (requires `onUpload` prop) |
| `FileImage` | Image file picker with preview |
| `Files` | Multiple file upload interface |
| `Upload` | Drag-and-drop file upload zone |
| `Map` | Interactive map picker (coordinates/geometry) |

**Relational Components (render-prop based):**
| Component | Description |
|-----------|-------------|
| `ListM2MInterface` | Many-to-Many list (requires render props) |
| `ListM2OInterface` | Many-to-One selector (requires render props) |
| `ListO2MInterface` | One-to-Many list (requires render props) |
| `ListM2AInterface` | Many-to-Any polymorphic list (requires render props) |

**Usage:**
```tsx
import { 
  Boolean, DateTime, SelectDropdown, Color, Notice, Tags 
} from '@microbuild/ui-interfaces';

// Basic components
<DateTime value={date} onChange={setDate} type="datetime" label="Pick a date" />
<Color value={color} onChange={setColor} label="Brand Color" opacity />
<Notice type="success" title="Saved">Your changes have been saved.</Notice>
<Tags value={tags} onChange={setTags} presets={['React', 'Vue', 'Angular']} />
```

### @microbuild/ui-collections

Dynamic collection components for forms and lists.

**Components:**
| Component | Description |
|-----------|-------------|
| `CollectionForm` | Dynamic form that auto-renders fields based on collection schema |
| `CollectionList` | Dynamic table with pagination, search, selection, bulk actions |

**Usage:**
```tsx
import { CollectionForm, CollectionList } from '@microbuild/ui-collections';

// Create/Edit form
<CollectionForm
  collection="products"
  mode="create"
  defaultValues={{ status: 'draft' }}
  onSuccess={(data) => console.log('Saved:', data)}
  excludeFields={['internal_notes']}
/>

// Dynamic list
<CollectionList
  collection="products"
  enableSelection
  enableSearch
  fields={['name', 'status', 'price']}
  filter={{ status: { _eq: 'published' } }}
  onItemClick={(item) => router.push(`/products/${item.id}`)}
/>
```

## 🔧 Workspace Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages and apps |
| `pnpm dev` | Run all apps in dev mode |
| `pnpm lint` | Lint all projects |
| `pnpm clean` | Remove node_modules and build artifacts |

## 📋 Project-Specific Commands

### main-nextjs
```bash
pnpm --filter main-nextjs dev      # Start dev server
pnpm --filter main-nextjs build    # Production build
pnpm --filter main-nextjs test     # Run Playwright tests
```

### nextjs-supabase-daas
```bash
pnpm --filter nextjs-supabase-daas dev      # Start dev server
pnpm --filter nextjs-supabase-daas build    # Production build
pnpm --filter nextjs-supabase-daas test     # Run Playwright tests
```

### ui-interfaces (Storybook)
```bash
# Run Storybook for component development
pnpm --filter @microbuild/ui-interfaces storybook

# Build static Storybook
pnpm --filter @microbuild/ui-interfaces build-storybook
```

Storybook runs at http://localhost:6006 and provides:
- Interactive component playground
- Props documentation with controls
- Visual testing for all interface components

## 🔗 Local Development Setup

For contributors who want to work on both projects:

1. **Clone the workspace** (or create it):
   ```bash
   mkdir Microbuild && cd Microbuild
   ```

2. **Clone both repositories**:
   ```bash
   git clone <main-nextjs-repo-url> main-nextjs
   git clone <nextjs-supabase-daas-repo-url> nextjs-supabase-daas
   ```

3. **Copy workspace files** (pnpm-workspace.yaml, package.json, packages/)

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

## 📝 Adding New Shared Components

1. Add component to `packages/ui-interfaces/src/<component-name>/`
2. Export from `packages/ui-interfaces/src/index.ts`
3. Update `packages/ui-interfaces/package.json` exports if needed
4. Run `pnpm install` to update workspace links

## 🔄 Dependency Management

- Shared dependencies go in the relevant package's `package.json`
- Use `workspace:*` protocol for internal packages
- Peer dependencies for Mantine, React in shared packages

## 📚 Documentation

- [main-nextjs README](./main-nextjs/README.md)
- [nextjs-supabase-daas README](./nextjs-supabase-daas/README.md)
- [ui-interfaces API](./packages/ui-interfaces/README.md)
- [ui-collections API](./packages/ui-collections/README.md)

## 🎯 Architecture (Directus-Inspired)

This workspace follows patterns from [Directus](https://directus.io/):

| Directus Package | Microbuild Equivalent | Purpose |
|-----------------|----------------------|---------|
| `@directus/types` | `@microbuild/types` | Shared TypeScript types |
| `@directus/composables` | `@microbuild/hooks` | Reusable React hooks |
| `@directus/utils` | `@microbuild/services` | Utility services |
| Vue interfaces | `@microbuild/ui-interfaces` | Field interface components |
| `v-form` component | `@microbuild/ui-collections` | Dynamic form/list components |

**Key Principles:**
1. **Separation of concerns** - Types, services, hooks, and UI in separate packages
2. **Workspace protocol** - Use `workspace:*` for internal dependencies
3. **Peer dependencies** - React/Mantine as peer deps in shared packages
4. **API abstraction** - Services abstract API calls for portability
