# Microbuild CLI - Agent Reference

> **For AI Agents**: This document provides complete information about the Microbuild CLI structure, component locations, and how to help users add components.

## Quick Reference

### Registry Location
```
packages/registry.json     # Master registry with all components, dependencies, and file mappings
```

### Key Commands
```bash
microbuild list                    # List all components with categories
microbuild list --json             # JSON output for programmatic use
microbuild list --category input   # Filter by category
microbuild info <component>        # Get full details about a component
microbuild tree <component>        # Show dependency tree
microbuild add <component>         # Add component to project
microbuild status                  # Show installed components
```

## Component Locations

### Source Packages (for reading code)
| Package | Path | Contains |
|---------|------|----------|
| **ui-interfaces** | `packages/ui-interfaces/src/` | 32+ interface components (input, select, datetime, etc.) |
| **ui-form** | `packages/ui-form/src/` | VForm dynamic form component |
| **ui-collections** | `packages/ui-collections/src/` | CollectionForm, CollectionList |
| **types** | `packages/types/src/` | TypeScript type definitions |
| **services** | `packages/services/src/` | API services (ItemsService, FieldsService) |
| **hooks** | `packages/hooks/src/` | React hooks (useRelationM2M, useFiles, etc.) |
| **utils** | `packages/utils/src/` | Utility functions (field-interface-mapper) |

### Component-to-File Mapping

#### High-Level Components (Collection category)
| Component | Source Path | Description |
|-----------|-------------|-------------|
| `vform` | `packages/ui-form/src/VForm.tsx` | Dynamic form - renders all 40+ interface types |
| `collection-form` | `packages/ui-collections/src/CollectionForm.tsx` | CRUD wrapper with data fetching (uses VForm) |
| `collection-list` | `packages/ui-collections/src/CollectionList.tsx` | Dynamic table with pagination |

#### Basic Interface Components (ui-interfaces)
| Component | Source Path | Category |
|-----------|-------------|----------|
| `input` | `packages/ui-interfaces/src/input/Input.tsx` | input |
| `textarea` | `packages/ui-interfaces/src/textarea/Textarea.tsx` | input |
| `input-code` | `packages/ui-interfaces/src/input-code/InputCode.tsx` | input |
| `boolean` | `packages/ui-interfaces/src/boolean/Boolean.tsx` | boolean |
| `toggle` | `packages/ui-interfaces/src/toggle/Toggle.tsx` | boolean |
| `datetime` | `packages/ui-interfaces/src/datetime/DateTime.tsx` | datetime |
| `select-dropdown` | `packages/ui-interfaces/src/select-dropdown/SelectDropdown.tsx` | selection |
| `select-radio` | `packages/ui-interfaces/src/select-radio/SelectRadio.tsx` | selection |
| `select-icon` | `packages/ui-interfaces/src/select-icon/SelectIcon.tsx` | selection |
| `tags` | `packages/ui-interfaces/src/tags/Tags.tsx` | input |
| `color` | `packages/ui-interfaces/src/color/Color.tsx` | selection |
| `slider` | `packages/ui-interfaces/src/slider/Slider.tsx` | input |
| `file` | `packages/ui-interfaces/src/file/File.tsx` | media |
| `file-image` | `packages/ui-interfaces/src/file-image/FileImage.tsx` | media |
| `files` | `packages/ui-interfaces/src/files/Files.tsx` | media |
| `divider` | `packages/ui-interfaces/src/divider/Divider.tsx` | layout |
| `notice` | `packages/ui-interfaces/src/notice/Notice.tsx` | layout |
| `group-detail` | `packages/ui-interfaces/src/group-detail/GroupDetail.tsx` | layout |
| `list-m2m` | `packages/ui-interfaces/src/list-m2m/ListM2M.tsx` | relational |
| `list-m2o` | `packages/ui-interfaces/src/list-m2o/ListM2O.tsx` | relational |
| `list-o2m` | `packages/ui-interfaces/src/list-o2m/ListO2M.tsx` | relational |
| `list-m2a` | `packages/ui-interfaces/src/list-m2a/ListM2A.tsx` | relational |

## Understanding Dependencies

### Types of Dependencies

1. **`dependencies`** - External npm packages (e.g., `@mantine/core`, `dayjs`)
2. **`internalDependencies`** - Lib modules (`types`, `services`, `hooks`, `utils`)
3. **`registryDependencies`** - Other Microbuild components

### VForm Dependency Tree (Most Complex)
```
vform
├── internalDependencies:
│   ├── types      → lib/microbuild/types/
│   ├── services   → lib/microbuild/services/
│   ├── hooks      → lib/microbuild/hooks/
│   └── utils      → lib/microbuild/utils/
│
└── registryDependencies (32 components):
    ├── input, textarea, input-code, input-block-editor
    ├── boolean, toggle
    ├── datetime
    ├── select-dropdown, select-radio, select-icon
    ├── select-multiple-checkbox, select-multiple-dropdown, select-multiple-checkbox-tree
    ├── color, tags, slider
    ├── autocomplete-api, collection-item-dropdown
    ├── file, file-image, files, upload
    ├── list-m2m, list-m2o, list-o2m, list-m2a
    ├── divider, notice, group-detail
    ├── rich-text-html, rich-text-markdown
    ├── map, workflow-button
    └── (each has its own dependencies)
```

### CollectionForm Dependency Tree
```
collection-form
├── internalDependencies:
│   ├── types
│   └── services
│
└── registryDependencies:
    └── vform (includes all 32 interface components)
```

## Common Agent Tasks

### Task 1: User wants to add VForm
```bash
# Best approach - let CLI handle all dependencies
microbuild add vform

# This will automatically:
# 1. Install lib modules: types, services, hooks, utils
# 2. Install all 32 interface components
# 3. Transform imports to local paths
# 4. List missing npm dependencies
```

### Task 2: User wants CollectionForm
```bash
# This adds CollectionForm + VForm + all dependencies
microbuild add collection-form
```

### Task 3: User wants specific components
```bash
# Add individual components
microbuild add input select-dropdown datetime

# Add by category
microbuild add --category selection
```

### Task 4: Check what's installed
```bash
microbuild status
microbuild status --json
```

### Task 5: Find a component's source
```bash
# Get detailed info including source path
microbuild info input
microbuild info vform
```

## Registry Schema

The `packages/registry.json` follows this structure:

```typescript
interface Registry {
  version: string;
  name: string;
  description: string;
  
  meta: {
    model: "copy-own";
    framework: "react";
    uiLibrary: "mantine-v8";
    typescript: true;
  };
  
  aliases: {
    "@/lib/microbuild": "./lib/microbuild";
    "@/components/ui": "./components/ui";
  };
  
  dependencies: {
    core: string[];    // @mantine/core, react, etc.
    icons: string[];   // @tabler/icons-react
    dates: string[];   // dayjs, @mantine/dates
    // ...
  };
  
  lib: {
    types: LibModule;    // Core types
    services: LibModule; // API services  
    hooks: LibModule;    // React hooks
    utils: LibModule;    // Utility functions
  };
  
  components: ComponentEntry[];  // 40+ components
  categories: CategoryEntry[];   // 10 categories
}

interface ComponentEntry {
  name: string;           // e.g., "input", "vform"
  title: string;          // e.g., "Input", "VForm"
  description: string;
  category: string;       // e.g., "input", "collection"
  files: FileMapping[];   // source → target mappings
  dependencies: string[]; // npm packages
  internalDependencies: string[];    // lib modules
  registryDependencies?: string[];   // other components
}
```

## Troubleshooting

### "Component not found" Error
1. Check exact name with `microbuild list`
2. Names are case-insensitive
3. Common aliases:
   - `select` → use `select-dropdown`
   - `m2m` → use `list-m2m`
   - `form` → use `vform` or `collection-form`

### "microbuild.json not found"
```bash
microbuild init --yes  # Initialize with defaults
```

### Missing Dependencies After Add
The CLI lists missing npm packages at the end:
```bash
# Install shown dependencies
pnpm add @mantine/core @mantine/hooks dayjs
```

### Checking Source Code
To read a component's source code before adding:
```bash
# The source is in packages/
cat packages/ui-interfaces/src/input/Input.tsx
cat packages/ui-form/src/VForm.tsx
```

## For Humans: Quick Start

```bash
# 1. Initialize in your project
cd your-nextjs-app
npx @microbuild/cli init

# 2. Add components
npx @microbuild/cli add input select-dropdown datetime

# 3. Or add the full form system
npx @microbuild/cli add collection-form

# 4. Install npm dependencies (shown at end)
pnpm add @mantine/core @mantine/hooks @tabler/icons-react
```

See [QUICKSTART.md](../QUICKSTART.md) for complete setup guide.
