# @microbuild/cli

CLI tool for adding Microbuild components to your project, similar to shadcn/ui.

## Features

- 🎨 Add components directly to your project (no npm install needed)
- 📦 Works with any React project (Next.js, Vite, CRA, etc.)
- 🔧 Automatically installs required dependencies
- 📝 TypeScript support out of the box
- 🎯 Only copy what you need

## Installation

### Global Installation

```bash
pnpm install -g @microbuild/cli
# or
npm install -g @microbuild/cli
# or
yarn global add @microbuild/cli
```

### One-time Usage (npx)

```bash
npx @microbuild/cli init
npx @microbuild/cli add input
```

## Usage

### Initialize Microbuild in Your Project

```bash
microbuild init
```

This will:
1. Create a `microbuild.json` configuration file
2. Set up the components directory structure
3. Install required peer dependencies
4. Configure path aliases (if needed)

### Add Components

Add a single component:

```bash
microbuild add input
```

Add multiple components:

```bash
microbuild add input select-dropdown datetime
```

Add all components from a category:

```bash
microbuild add --category selection
```

### List Available Components

```bash
microbuild list
```

List components by category:

```bash
microbuild list --category input
```

### Diff Changes

Preview changes before adding a component:

```bash
microbuild diff input
```

## Configuration

After running `microbuild init`, a `microbuild.json` file is created:

```json
{
  "$schema": "https://microbuild.dev/schema.json",
  "style": "default",
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "types": "@microbuild/types",
    "services": "@microbuild/services",
    "hooks": "@microbuild/hooks"
  }
}
```

## Project Structure

After initialization:

```
your-project/
├── src/
│   └── components/
│       └── ui/              # Microbuild components
│           ├── input/
│           │   └── index.tsx
│           ├── select-dropdown/
│           │   └── index.tsx
│           └── ...
├── microbuild.json          # Configuration
└── package.json
```

## Commands

### `init`

Initialize Microbuild in your project.

```bash
microbuild init [options]

Options:
  -y, --yes           Skip prompts and use defaults
  -c, --cwd <path>    Project directory (default: current directory)
```

### `add`

Add components to your project.

```bash
microbuild add [components...] [options]

Arguments:
  components          Component names to add

Options:
  -a, --all           Add all components
  -c, --category      Add all components from a category
  -o, --overwrite     Overwrite existing components
  --cwd <path>        Project directory
```

### `list`

List all available components.

```bash
microbuild list [options]

Options:
  --category <name>   Filter by category
  --json              Output as JSON
```

### `diff`

Preview changes before adding a component.

```bash
microbuild diff <component> [options]

Arguments:
  component           Component name

Options:
  --cwd <path>        Project directory
```

## Examples

### Basic Setup

```bash
# Initialize in a Next.js project
cd my-nextjs-app
microbuild init

# Add form components
microbuild add input textarea select-dropdown

# Use in your app
import { Input } from '@/components/ui/input';
```

### Adding Relational Components

```bash
# Add M2M relation component (includes dependencies)
microbuild add list-m2m

# This automatically ensures these are available:
# - @microbuild/types
# - @microbuild/hooks
# - @microbuild/services
```

### Custom Component Directory

Edit `microbuild.json`:

```json
{
  "aliases": {
    "components": "@/app/components"
  }
}
```

Then add components:

```bash
microbuild add button
# Creates: src/app/components/ui/button/index.tsx
```

## Component Categories

- **Input**: Input, Textarea, InputCode, Tags
- **Selection**: SelectDropdown, SelectRadio, SelectMultipleCheckbox, SelectIcon, AutocompleteAPI
- **DateTime**: DateTime
- **Boolean**: Boolean, Toggle
- **Media**: FileInterface, FileImage, Files, Upload, Color
- **Relational**: ListM2M, ListM2O, ListO2M, ListM2A
- **Layout**: Divider, Notice, GroupDetail, Slider
- **Rich Text**: InputBlockEditor, RichTextHtml, RichTextMarkdown

## How It Works

Unlike traditional npm packages, the CLI copies component source code directly into your project. This gives you:

1. **Full Control** - Modify components to fit your needs
2. **No Version Lock** - Components are yours to maintain
3. **Tree Shaking** - Only bundle what you use
4. **Type Safety** - Full TypeScript support
5. **No Breaking Changes** - Updates are opt-in

## Dependencies

The CLI automatically manages dependencies:

- **Microbuild Packages**: Added as workspace dependencies or npm packages
- **Peer Dependencies**: Prompts to install @mantine/core, react, etc.
- **Component Dependencies**: Handles transitive dependencies automatically

## Comparison with shadcn/ui

| Feature | shadcn/ui | @microbuild/cli |
|---------|-----------|-----------------|
| Component Source | Copies to project | Copies to project |
| Base Library | Radix UI | Mantine v8 |
| Use Case | General UI | CMS/Directus apps |
| Relations | No | Yes (M2M, M2O, O2M, M2A) |
| Backend Integration | No | Yes (Directus-compatible) |

## Troubleshooting

### Component not found

Make sure you're using the correct component name:

```bash
microbuild list
```

### Path alias errors

Configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@microbuild/*": ["./node_modules/@microbuild/*/src"]
    }
  }
}
```

### Dependency conflicts

Update peer dependencies:

```bash
pnpm update @mantine/core @mantine/hooks @mantine/dates
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## License

MIT
