# @microbuild/cli

A CLI for adding Microbuild components to your project.

## Usage

Use the `init` command to set up a new project and the `add` command to add components.

```bash
npx @microbuild/cli init
npx @microbuild/cli add input select-dropdown
```

## init

Use the `init` command to initialize configuration and dependencies for a new project.

The `init` command creates a `microbuild.json` file, sets up directory structure, and checks for required dependencies.

```bash
npx @microbuild/cli init
```

### Options

```
Usage: microbuild init [options]

initialize your project and install dependencies

Options:
  -y, --yes       skip confirmation prompt (default: false)
  -c, --cwd <cwd> the working directory (defaults to current directory)
  -h, --help      display help for command
```

## add

Use the `add` command to add components to your project.

```bash
npx @microbuild/cli add [component]
```

### Options

```
Usage: microbuild add [options] [components...]

add components to your project

Arguments:
  components         name of components to add

Options:
  -y, --yes          skip confirmation prompt (default: false)
  -o, --overwrite    overwrite existing files (default: false)
  -c, --cwd <cwd>    the working directory (defaults to current directory)
  -a, --all          add all available components (default: false)
  --category <name>  add all components from a category
  -h, --help         display help for command
```

### Examples

```bash
# Add specific components
npx @microbuild/cli add input
npx @microbuild/cli add input select-dropdown datetime

# Add all components from a category
npx @microbuild/cli add --category selection

# Add all components
npx @microbuild/cli add --all
```

## list

Use the `list` command to view all available components.

```bash
npx @microbuild/cli list
```

### Options

```
Usage: microbuild list [options]

list available components

Options:
  --category <name>  filter by category
  --json             output as JSON
  -h, --help         display help for command
```

## diff

Use the `diff` command to preview changes before adding a component.

```bash
npx @microbuild/cli diff [component]
```

### Options

```
Usage: microbuild diff [options] <component>

preview changes before adding a component

Options:
  -c, --cwd <cwd>  the working directory (defaults to current directory)
  -h, --help       display help for command
```

## status

Use the `status` command to view all installed Microbuild components and their origins.

```bash
npx @microbuild/cli status
```

### Options

```
Usage: microbuild status [options]

show installed Microbuild components and their origins

Options:
  --json           output as JSON
  -c, --cwd <cwd>  the working directory (defaults to current directory)
  -h, --help       display help for command
```

### Example Output

```
📦 Microbuild Status

Config file: microbuild.json
Lib modules: types, hooks, services
Components:  input, select-dropdown, list-m2m

Installed Files:

  @microbuild/ui-interfaces/input
    └─ src/components/ui/input.tsx
       v1.0.0 (2026-01-12)

  @microbuild/lib/hooks
    └─ src/lib/microbuild/hooks/useRelationM2M.ts
       v1.0.0 (2026-01-12)

Total: 15 files from Microbuild
```

## microbuild.json

The `microbuild.json` file holds configuration for your project. We use it to understand how your project is set up and how to generate components customized for your project.

You can create a `microbuild.json` file by running the `init` command.

```json
{
  "$schema": "https://microbuild.dev/schema.json",
  "model": "copy-own",
  "tsx": true,
  "srcDir": true,
  "aliases": {
    "components": "@/components/ui",
    "lib": "@/lib/microbuild"
  },
  "installedLib": [],
  "installedComponents": []
}
```

### tsx

Choose between TypeScript or JavaScript components.

Setting this option to `false` allows components to be added as JavaScript with the `.jsx` file extension.

```json
{
  "tsx": true | false
}
```

### srcDir

Whether your project uses the `src/` directory structure.

```json
{
  "srcDir": true | false
}
```

### aliases

The CLI uses these values to place generated components in the correct location.

```json
{
  "aliases": {
    "components": "@/components/ui",
    "lib": "@/lib/microbuild"
  }
}
```

Path aliases have to be set up in your `tsconfig.json` or `jsconfig.json` file:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### installedLib and installedComponents

These arrays track what has been installed. The CLI uses them to avoid reinstalling dependencies.

## What Gets Copied

When you add a component, the CLI:

1. **Copies the component source** to your components directory
2. **Copies required lib modules** (types, services, hooks) if needed
3. **Transforms imports** from `@microbuild/*` to local paths
4. **Reports missing dependencies** that need to be installed

### Example: Adding `list-m2m`

```bash
npx @microbuild/cli add list-m2m
```

This copies:
- `components/ui/list-m2m.tsx` - The component
- `lib/microbuild/types/` - Type definitions
- `lib/microbuild/services/` - CRUD services
- `lib/microbuild/hooks/` - React hooks

### Import Transformation

Original (in source):
```tsx
import { useRelationM2M } from '@microbuild/hooks';
import type { M2MItem } from '@microbuild/types';
```

Transformed (in your project):
```tsx
import { useRelationM2M } from '@/lib/microbuild/hooks';
import type { M2MItem } from '@/lib/microbuild/types';
```

## Component Categories

| Category | Components |
|----------|------------|
| `input` | Input, Textarea, InputCode, Tags |
| `selection` | SelectDropdown, SelectRadio, SelectMultipleCheckbox, SelectIcon, AutocompleteAPI, CollectionItemDropdown |
| `datetime` | DateTime |
| `boolean` | Boolean, Toggle |
| `media` | FileInterface, FileImage, Files, Upload, Color |
| `relational` | ListM2M, ListM2O, ListO2M, ListM2A |
| `layout` | Divider, Notice, GroupDetail, Slider |
| `rich-text` | RichTextHtml, RichTextMarkdown |
| `collection` | CollectionForm, CollectionList |

## Peer Dependencies

Components require these external packages:

**Core (always needed):**
```bash
pnpm add @mantine/core @mantine/hooks react react-dom
```

**Component-specific:**
```bash
# DateTime component
pnpm add @mantine/dates dayjs

# Icon components
pnpm add @tabler/icons-react

# File upload
pnpm add @mantine/dropzone

# CollectionForm notifications
pnpm add @mantine/notifications

# Rich text editor
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

**Utils (optional, for cn() helper):**
```bash
pnpm add clsx tailwind-merge
```

## Project Structure After Installation

```
your-project/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── input.tsx
│   │       ├── select-dropdown.tsx
│   │       └── datetime.tsx
│   └── lib/
│       └── microbuild/
│           ├── utils.ts
│           ├── types/
│           │   ├── index.ts
│           │   ├── core.ts
│           │   ├── file.ts
│           │   └── relations.ts
│           ├── services/
│           │   ├── index.ts
│           │   ├── api-request.ts
│           │   ├── items.ts
│           │   ├── fields.ts
│           │   └── collections.ts
│           └── hooks/
│               ├── index.ts
│               ├── useRelationM2M.ts
│               ├── useRelationM2O.ts
│               └── ...
├── microbuild.json
└── package.json
```

## CLI Commands Reference

```bash
# Initialize project
microbuild init [--yes] [--cwd <path>]

# Add components
microbuild add [components...] [--all] [--category <name>] [--overwrite] [--cwd <path>]

# List components
microbuild list [--category <name>] [--json]

# Preview changes
microbuild diff <component> [--cwd <path>]
```

## Troubleshooting

### "Registry file not found"

Make sure you're running the CLI from within the Microbuild workspace or have the registry properly configured.

### "microbuild.json not found"

Run `npx @microbuild/cli init` first to initialize your project.

### Import errors after adding components

Ensure your `tsconfig.json` has the correct path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Development

Build the CLI:

```bash
cd packages/cli
pnpm build
```

Run in development:

```bash
pnpm dev
```

Test locally:

```bash
node dist/index.js init
node dist/index.js add input
```

## License

MIT
