# Microbuild UI Packages

A pnpm workspace containing reusable components distributed via Copy & Own model.

## 🏗️ Structure

```
microbuild-ui-packages/
├── pnpm-workspace.yaml     # Workspace configuration
├── package.json            # Root scripts
└── packages/               # Component library (source of truth)
    ├── registry.json       # Component registry schema
    ├── cli/                # CLI tool for developers (@microbuild/cli)
    ├── mcp-server/         # MCP server for AI agents (@microbuild/mcp-server)
    ├── ui-interfaces/      # Field interface components
    ├── ui-collections/     # Collection Form & List
    ├── types/              # Shared TypeScript types
    ├── services/           # Shared service classes
    ├── hooks/              # Shared React hooks
    └── utils/              # Utility functions (field mapper, etc.)
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
```

### Development

```bash
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
- `PermissionsService` - Field-level permissions

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
- `useRelationM2A` / `useRelationM2AItems` - Many-to-Any (polymorphic) relationships
- `useFiles` - File upload and management
- `useSelection` - Item selection management
- `usePreset` - Collection presets (filters, search, layout)
- `useEditsGuard` / `useHasEdits` - Unsaved changes navigation guard
- `useClipboard` - Clipboard operations with notifications
- `useLocalStorage` - Persistent localStorage state

**Usage:**
```tsx
import { useRelationM2M, useRelationM2MItems } from '@microbuild/hooks';

function ProductTags({ productId }: { productId: string }) {
  const { relationInfo, loading } = useRelationM2M('products', 'tags');
  const { items, loadItems, selectItems } = useRelationM2MItems(relationInfo, productId);
  
  // Manage M2M relationships...
}
```

### @microbuild/utils

Utility functions for field interface mapping and validation.

**Key Functions:**
- `getFieldInterface` - Map field types to UI interface components
- `isFieldReadOnly` - Determine read-only status based on context
- `getFieldValidation` - Extract validation rules from field schema
- `formatFieldValue` - Format values for display
- `isPresentationField` - Check for presentation-only fields

**Usage:**
```tsx
import { getFieldInterface, isFieldReadOnly } from '@microbuild/utils';

const interfaceConfig = getFieldInterface(field);
// Returns: { type: 'input', props: { type: 'string' } }

const readOnly = isFieldReadOnly(field, 'edit');
// Returns: true for auto-increment PKs, UUID PKs, etc.
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
| `SelectMultipleCheckboxTree` | Tree-based hierarchical multi-select |
| `SelectMultipleDropdown` | Dropdown-based multi-select with search |
| `SelectIcon` | Icon picker with categorized Tabler icons |
| `Tags` | Tag input with presets and custom tags |
| `AutocompleteAPI` | External API-backed autocomplete |
| `CollectionItemDropdown` | Collection item selector dropdown |

**Layout Components:**
| Component | Description |
|-----------|-----------|
| `Divider` | Horizontal/vertical divider with title support |
| `Notice` | Alert/notice component (info, success, warning, danger) |
| `Slider` | Range slider with numeric type support |
| `GroupDetail` | Collapsible form section |

**Rich Text Components:** *(require additional dependencies)*
| Component | Description |
|-----------|-----------|
| `RichTextHtml` | WYSIWYG HTML editor (requires @tiptap packages) |
| `RichTextMarkdown` | Markdown editor with live preview |
| `InputBlockEditor` | Block-based editor (Notion-style) |
| `InputCode` | Monospace code editor with syntax highlighting |

**Media Components:**
| Component | Description |
|-----------|-----------|
| `FileInterface` | Single file upload wrapper (requires `onUpload` prop) |
| `FileImage` | Image file picker with preview and focal point |
| `Files` | Multiple file upload interface with drag & drop |
| `Upload` | Drag-and-drop file upload zone |
| `Color` | Color picker with RGB/HSL support, presets, opacity |
| `Map` | Interactive map placeholder for coordinates |
| `MapWithRealMap` | Full MapLibre GL JS map with drawing tools |

**Relational Components:**
| Component | Description |
|-----------|-----------|
| `ListM2M` | Many-to-Many list with hooks integration |
| `ListM2O` | Many-to-One selector with hooks integration |
| `ListO2M` | One-to-Many list with hooks integration |
| `ListM2A` | Many-to-Any polymorphic list with hooks integration |
| `ListM2MInterface` | Many-to-Many (render-prop variant) |
| `ListM2OInterface` | Many-to-One (render-prop variant) |
| `ListO2MInterface` | One-to-Many (render-prop variant) |

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

## 🤖 Distribution & AI Tools

Microbuild includes two powerful distribution tools:

### MCP Server - For AI Agents

Expose Microbuild components to AI assistants like VS Code Copilot.

```bash
# Build and configure
pnpm build:mcp

# Add to VS Code settings.json or .vscode/mcp.json:
{
  "servers": {
    "microbuild": {
      "command": "node",
      "args": ["/path/to/microbuild-ui-packages/packages/mcp-server/dist/index.js"]
    }
  }
}

# Use with Copilot:
# "Show me how to use the Input component from Microbuild"
# "Generate a CollectionForm for products"
```

### CLI Tool - For Developers

Copy components directly to your project (like shadcn/ui).

```bash
# Build CLI
pnpm build:cli

# Use in any project
npx @microbuild/cli init
npx @microbuild/cli add input select-dropdown
npx @microbuild/cli list
npx @microbuild/cli add --category selection
npx @microbuild/cli add --all
```

**Benefits:**
- ✅ Source code remains private
- ✅ AI agents can discover and use components
- ✅ Developers get full control over copied code
- ✅ No npm publishing required

See [DISTRIBUTION.md](./DISTRIBUTION.md) for complete setup guide.

## 🔧 Workspace Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages and apps |
| `pnpm build:mcp` | Build MCP server for AI agents |
| `pnpm build:cli` | Build CLI tool |
| `pnpm dev` | Run all apps in dev mode |
| `pnpm mcp:dev` | Run MCP server in watch mode |
| `pnpm cli` | Run CLI tool locally |
| `pnpm lint` | Lint all projects |
| `pnpm clean` | Remove node_modules and build artifacts |
| `pnpm storybook` | Run Storybook for component development |

## 📋 Storybook
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

##  Adding New Shared Components

1. Add component to `packages/ui-interfaces/src/<component-name>/`
2. Export from `packages/ui-interfaces/src/index.ts`
3. Update `packages/ui-interfaces/package.json` exports if needed
4. Run `pnpm install` to update workspace links

## 🔄 Dependency Management

- Shared dependencies go in the relevant package's `package.json`
- Use `workspace:*` protocol for internal packages
- Peer dependencies for Mantine, React in shared packages

## 📚 Documentation

- [Packages Overview](./packages/README.md)
- [Quick Start](./QUICKSTART.md)
- [Distribution Guide](./DISTRIBUTION.md)
- [Architecture](./ARCHITECTURE.md)

## 🚀 RAD Platform Integration

Microbuild integrates with the **microbuild-copilot** RAD (Rapid Application Development) platform for AI-assisted development.

### Setup with microbuild-copilot

```bash
# Clone the RAD platform boilerplate
git clone https://github.com/your-org/microbuild-copilot.git my-new-app
cd my-new-app

# The .vscode/mcp.json is pre-configured for Microbuild MCP server
# Just update the path to your microbuild-ui-packages installation
```

### What microbuild-copilot provides:
- **Custom Agents**: `@architect`, `@planner`, `@scaffold`, `@implement`, `@reviewer`, `@tester`, `@database`
- **Prompt Templates**: `/create-project`, `/create-feature`, `/add-microbuild`, etc.
- **Project Templates**: minimal, standard, enterprise
- **VS Code Configuration**: MCP servers, settings, launch configs

See [microbuild-copilot](https://github.com/your-org/microbuild-copilot) for full documentation.

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
1. **Copy & Own** - Components are copied to projects as source files
2. **Separation of concerns** - Types, services, hooks, and UI in separate packages
3. **Internal workspace** - Packages use `workspace:*` for cross-package dependencies
4. **Peer dependencies** - React/Mantine as peer deps in shared packages
5. **API abstraction** - Services abstract API calls for portability
