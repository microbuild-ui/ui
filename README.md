# Microbuild UI Packages

A pnpm workspace containing reusable components distributed via Copy & Own model.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Setup guide for MCP Server & CLI |
| [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md) | Complete documentation index |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture diagrams |
| [docs/DISTRIBUTION.md](docs/DISTRIBUTION.md) | Distribution methods guide |
| [docs/TESTING.md](docs/TESTING.md) | Playwright E2E testing guide |
| [docs/WINDOWS.md](docs/WINDOWS.md) | Windows development guide |

## 🏗️ Structure

```
microbuild-ui-packages/
├── pnpm-workspace.yaml     # Workspace configuration
├── package.json            # Root scripts
├── docs/                   # Documentation
│   ├── DOCS_INDEX.md       # Documentation index
│   ├── ARCHITECTURE.md     # System architecture
│   ├── DISTRIBUTION.md     # Distribution guide
│   └── WINDOWS.md          # Windows setup
├── tests/                  # Playwright E2E tests
│   ├── auth.setup.ts       # Authentication setup
│   └── ui-form/            # VForm component tests
└── packages/               # Component library (source of truth)
    ├── registry.json       # Component registry schema
    ├── cli/                # CLI tool for developers (@microbuild/cli)
    ├── mcp-server/         # MCP server for AI agents (@microbuild/mcp-server)
    ├── ui-interfaces/      # Field interface components
    ├── ui-form/            # VForm dynamic form component (NEW: with Storybook)
    │   ├── src/            # VForm component and utilities
    │   ├── VForm.stories.tsx        # Storybook stories with mocked data
    │   └── VForm.daas.stories.tsx   # DaaS playground for testing with real API
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

Service classes for CRUD operations on Directus collections, plus DaaS API configuration and authentication.

**Available Services:**
- `ItemsService` - Generic CRUD for any collection
- `FieldsService` - Read field definitions
- `CollectionsService` - Read collection metadata
- `PermissionsService` - Field-level permissions

**API Request Utilities:**
- `apiRequest` - Make API requests (supports both proxy and direct DaaS modes)
- `buildApiUrl` - Build URL for API requests respecting DaaS configuration
- `getApiHeaders` - Get headers with auth token when in direct mode

**DaaS Context (for Storybook/Testing):**
- `DaaSProvider` - React provider for direct DaaS API access with authentication state
- `useDaaSContext` - Hook to access DaaS config, user info, and auth helpers
- `setGlobalDaaSConfig` - Set global config for non-React contexts

**Authentication (follows DaaS architecture):**
- Cookie-based sessions for browser requests (automatic)
- Static tokens for programmatic access (Directus-style)
- JWT Bearer tokens for API clients with Supabase Auth

**Usage:**
```tsx
import { ItemsService, FieldsService } from '@microbuild/services';

const itemsService = new ItemsService('products');
const items = await itemsService.readByQuery({ filter: { status: { _eq: 'published' } } });

const fieldsService = new FieldsService();
const fields = await fieldsService.readAll('products');
```

**Direct DaaS Mode (Storybook/Testing):**
```tsx
import { DaaSProvider } from '@microbuild/services';

// Wrap components to enable direct DaaS API access
<DaaSProvider config={{ url: 'https://xxx.microbuild-daas.xtremax.com', token: 'your-token' }}>
  <VForm collection="articles" />
</DaaSProvider>
```

### @microbuild/hooks

React hooks for managing authentication, permissions, Directus relationships, selection, presets, and workflows.

**Authentication Hooks (DaaS-compatible):**
- `useAuth` - Authentication state (user, isAdmin, isAuthenticated) and methods (refresh, logout, checkPermission)
- `usePermissions` - Field-level and action-level permission checking (canPerform, getAccessibleFields, isFieldAccessible)
- `useDaaSContext` / `DaaSProvider` - DaaS configuration context for direct API access

**Relation Hooks:**
- `useRelationM2M` / `useRelationM2MItems` - Many-to-Many relationships
- `useRelationM2O` / `useRelationM2OItem` - Many-to-One relationships  
- `useRelationO2M` / `useRelationO2MItems` - One-to-Many relationships
- `useRelationM2A` / `useRelationM2AItems` - Many-to-Any (polymorphic) relationships
- `useFiles` - File upload and management

**Selection & Preset Hooks:**
- `useSelection` - Item selection management
- `usePreset` - Collection presets (filters, search, layout)

**Navigation & State Hooks:**
- `useEditsGuard` / `useHasEdits` - Unsaved changes navigation guard
- `useClipboard` - Clipboard operations with notifications
- `useLocalStorage` - Persistent localStorage state

**Workflow & Versioning Hooks:**
- `useVersions` - Content version management (create, save, delete versions)
- `useWorkflowAssignment` - Check if collection has workflow assignment
- `useWorkflowVersioning` - Workflow + versioning integration (edit modes, state tracking)

**Usage:**
```tsx
import { useAuth, usePermissions, useRelationM2M } from '@microbuild/hooks';

// Authentication
function UserProfile() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth();
  
  if (!isAuthenticated) return <LoginButton />;
  return <div>Welcome, {user.first_name}!</div>;
}

// Permissions
function ArticleEditor({ articleId }) {
  const { canPerform, getAccessibleFields } = usePermissions({ collections: ['articles'] });
  
  if (!canPerform('articles', 'update')) return <Alert>No edit access</Alert>;
  const fields = getAccessibleFields('articles', 'update');
  // ...
}

// Relations
function ProductTags({ productId }: { productId: string }) {
  const { relationInfo, loading } = useRelationM2M('products', 'tags');
  // Manage M2M relationships...
}
```

### @microbuild/utils

Utility functions for field interface mapping and validation. The field interface mapper is the core logic that VForm uses to determine which UI component to render for each field type.

**Key Functions:**
- `getFieldInterface` - Map field types to UI interface components (40+ types)
- `isFieldReadOnly` - Determine read-only status based on context
- `getFieldValidation` - Extract validation rules from field schema
- `formatFieldValue` - Format values for display
- `isPresentationField` - Check for presentation-only fields (divider, notice)

**Usage:**
```tsx
import { getFieldInterface, isFieldReadOnly } from '@microbuild/utils';

const interfaceConfig = getFieldInterface(field);
// Returns: { type: 'input', props: { type: 'string' } }
// or: { type: 'select-dropdown', props: { choices: [...] } }
// or: { type: 'list-m2m', props: { relationInfo: {...} } }

const readOnly = isFieldReadOnly(field, 'edit');
// Returns: true for auto-increment PKs, UUID PKs, etc.
```

**CLI Installation:**
When you add components via CLI, the field-interface-mapper is automatically included in `lib/microbuild/` allowing VForm and CollectionForm to correctly render all 40+ interface types.

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
| `InputBlockEditor` | Block-based editor using EditorJS (SSR-safe with dynamic import) |
| `InputCode` | Monospace code editor with syntax highlighting |

**Media Components:**
| Component | Description |
|-----------|-----------|
| `File` | Single file with DaaS Files API integration |
| `FileImage` | Image file picker with preview, lightbox, and crop |
| `Files` | Multiple files interface (M2M relationship with junction table support) |
| `Upload` | Low-level drag-and-drop file upload zone |
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

**Workflow Components:**
| Component | Description |
|-----------|-------------|
| `WorkflowButton` | Workflow state button with transitions, policy-based commands, and revision comparison |

**Usage:**
```tsx
import { 
  Boolean, DateTime, SelectDropdown, Color, Notice, Tags, WorkflowButton 
} from '@microbuild/ui-interfaces';

// Basic components
<DateTime value={date} onChange={setDate} type="datetime" label="Pick a date" />
<Color value={color} onChange={setColor} label="Brand Color" opacity />
<Notice type="success" title="Saved">Your changes have been saved.</Notice>
<Tags value={tags} onChange={setTags} presets={['React', 'Vue', 'Angular']} />

// Workflow state management
<WorkflowButton
  itemId="article-123"
  collection="articles"
  canCompare={true}
  onChange={(value) => console.log('New state:', value)}
  onTransition={() => console.log('Transition complete')}
/>
```

### @microbuild/ui-form

Dynamic form component system inspired by Directus v-form, with comprehensive Storybook documentation and built-in permission enforcement.

**Components:**
| Component | Description |
|-----------|-------------|
| `VForm` | Main dynamic form component that renders fields based on collection schema |
| `FormField` | Individual field wrapper with label, validation, and interface rendering |
| `FormFieldLabel` | Label component with required indicator and tooltip |
| `FormFieldInterface` | Dynamic interface component loader |

**Features:**
- 🎯 Dynamic field rendering based on schema
- 📝 40+ interface types (input, textarea, boolean, datetime, select, etc.)
- 🔐 **Permission enforcement** - Filter fields based on user permissions (DaaS-compatible)
- ✅ Validation error display with field-level messages
- 📱 Responsive grid layout (full, half, fill widths)
- 🔄 Change tracking and dirty state management
- 📊 Field groups and hierarchical organization
- 🎭 Create vs Edit mode with proper state handling
- 🔒 Read-only and disabled field support

**Storybook Stories:**
- **Basic Stories** (`VForm.stories.tsx`) - Mocked data examples covering all interface types, layouts, validation, and states
- **DaaS Playground** (`VForm.daas.stories.tsx`) - Connect to a real DaaS instance and test with actual collection schemas

**Usage:**
```tsx
import { VForm } from '@microbuild/ui-form';
import { DaaSProvider } from '@microbuild/services';

// Basic usage
function MyForm() {
  const [values, setValues] = useState({});

  return (
    <VForm
      collection="articles"
      modelValue={values}
      onUpdate={setValues}
      validationErrors={errors}
      primaryKey="+"  // '+' for create mode
    />
  );
}

// With permission enforcement
function ProtectedForm() {
  return (
    <DaaSProvider config={{ url: 'https://xxx.microbuild-daas.xtremax.com', token: 'xxx' }}>
      <VForm
        collection="articles"
        modelValue={values}
        onUpdate={setValues}
        enforcePermissions={true}
        action="update"  // 'create' | 'update' | 'read'
        onPermissionsLoaded={(fields) => console.log('Accessible:', fields)}
      />
    </DaaSProvider>
  );
}
```

**Testing:**
```bash
# Run Storybook for VForm development
pnpm storybook:form

# Run isolated component tests
pnpm test:storybook

# Run DaaS integration tests
pnpm test:e2e
```

### @microbuild/ui-collections

Dynamic collection components for forms and lists.

**Components:**
| Component | Description |
|-----------|-------------|
| `CollectionForm` | CRUD form wrapper with data fetching - uses VForm for rendering all 40+ interface types |
| `CollectionList` | Dynamic table with pagination, search, selection, bulk actions |

**Architecture:**
- **CollectionForm** = Data layer (fetch fields, load/save items, CRUD operations)
- **VForm** = Presentation layer (renders fields with proper interfaces from @microbuild/ui-interfaces)

When you install `collection-form` via CLI, VForm and all 32 dependent interface components are automatically included.

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

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup guide.

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
| `pnpm cli validate` | Validate Microbuild installation in a project |
| `pnpm lint` | Lint all projects |
| `pnpm clean` | Remove node_modules and build artifacts |
| `pnpm storybook` | Run Storybook for ui-interfaces |
| `pnpm storybook:form` | Run Storybook for ui-form (VForm) |
| `pnpm test:e2e` | Run Playwright E2E tests against DaaS |
| `pnpm test:storybook` | Run Playwright tests against Storybook |

## 📋 Storybook
```bash
# Run Storybook for ui-interfaces component development
pnpm storybook

# Run Storybook for VForm development
pnpm storybook:form

# Build static Storybook
pnpm --filter @microbuild/ui-interfaces build-storybook
```

Storybook runs at http://localhost:6006 and provides:
- Interactive component playground
- Props documentation with controls
- Visual testing for all interface components

## 🧪 Testing

Microbuild uses a **two-tier testing strategy** for comprehensive validation:

### Tier 1: Storybook Tests (Isolated Component Testing)
```bash
# Start VForm Storybook and run Playwright tests
pnpm storybook:form          # Start Storybook on port 6006
pnpm test:storybook          # Run Playwright against Storybook
```

**Advantages:**
- ✅ **No Authentication Required** - Test components with mocked data
- ✅ **Fast Feedback** - Isolated component testing without backend dependencies
- ✅ **All Interface Types** - Test any field configuration without database setup
- ✅ **DaaS Playground** - Connect to real DaaS API and test with actual schemas

**Test Files:**
- `tests/ui-form/vform-storybook.spec.ts` - Tests against Storybook stories
- `packages/ui-form/src/VForm.stories.tsx` - Basic stories with mocked data
- `packages/ui-form/src/VForm.daas.stories.tsx` - DaaS playground for real API testing

### Tier 2: DaaS E2E Tests (Full Integration Testing)
```bash
# Run against hosted DaaS (requires auth)
pnpm test:e2e                # Run all E2E tests
pnpm test:e2e:ui             # Interactive Playwright UI
```

**Advantages:**
- ✅ **Real API** - Actual Supabase backend integration
- ✅ **Authentication** - Test with real users and roles
- ✅ **Permissions** - Verify field-level access control
- ✅ **Full Workflow** - End-to-end form submission and validation

**Test Files:**
- `tests/ui-form/vform-daas.spec.ts` - Integration tests with DaaS app
- `tests/ui-form/vform.spec.ts` - Complete E2E workflow tests
- `tests/auth.setup.ts` - Authentication setup for admin user
- `tests/helpers/seed-test-data.ts` - Test data seeding utilities

**Playwright Configuration:**
- `playwright.config.ts` - Dual-mode setup (Storybook + DaaS)
- Auto-starts Storybook for component tests
- Uses admin authentication for DaaS E2E tests

See [docs/TESTING.md](docs/TESTING.md) for complete testing guide and best practices.

##  Adding New Shared Components

1. Add component to `packages/ui-interfaces/src/<component-name>/`
2. Export from `packages/ui-interfaces/src/index.ts`
3. Update `packages/ui-interfaces/package.json` exports if needed
4. Run `pnpm install` to update workspace links

## 🔄 Dependency Management

- Shared dependencies go in the relevant package's `package.json`
- Use `workspace:*` protocol for internal packages
- Peer dependencies for Mantine, React in shared packages

##  RAD Platform Integration

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
| `v-form` component | `@microbuild/ui-form` | Dynamic form component (VForm) |
| Collection views | `@microbuild/ui-collections` | Dynamic form/list components |

**Key Principles:**
1. **Copy & Own** - Components are copied to projects as source files
2. **Separation of concerns** - Types, services, hooks, and UI in separate packages
3. **Internal workspace** - Packages use `workspace:*` for cross-package dependencies
4. **Peer dependencies** - React/Mantine as peer deps in shared packages
5. **API abstraction** - Services abstract API calls for portability
