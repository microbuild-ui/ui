# Distribution

Microbuild UI Packages is a code distribution system. It defines a schema for components and a CLI to distribute them.

- **Schema**: A flat-file structure (`registry.json`) that defines the components, their dependencies, and properties
- **CLI**: A command-line tool to distribute and install components with cross-framework support

You can use the schema to distribute your components to other projects or have AI generate new components based on existing schema.

## Quick Start

```bash
# 1. Initialize in your project
npx @microbuild/cli init

# 2. Add components
npx @microbuild/cli add input select-dropdown datetime

# 3. Use in your code
import { Input } from '@/components/ui/input'
```

## How It Works

### 1. CLI Tool

The CLI copies component source code directly into your project with imports transformed to local paths.

```bash
# Initialize in your project
npx @microbuild/cli init

# Add components
npx @microbuild/cli add input select-dropdown datetime

# List available components
npx @microbuild/cli list

# Add by category
npx @microbuild/cli add --category selection

# Preview changes before adding
npx @microbuild/cli diff input
```

### 2. Project Structure

When you add components, they're copied to your project:

```
your-project/
├── src/
│   ├── components/
│   │   └── ui/                      # UI components
│   │       ├── input.tsx
│   │       ├── select-dropdown.tsx
│   │       └── datetime.tsx
│   └── lib/
│       └── microbuild/              # Lib modules (auto-resolved)
│           ├── utils.ts
│           ├── types/
│           ├── services/
│           └── hooks/
└── microbuild.json                  # Configuration
```

### 3. Import Transformation

```tsx
// Original (in source)
import { useRelationM2M } from '@microbuild/hooks';
import type { M2MItem } from '@microbuild/types';

// Transformed (in your project)
import { useRelationM2M } from '@/lib/microbuild/hooks';
import type { M2MItem } from '@/lib/microbuild/types';
```

## AI-Ready

The design of Microbuild makes it easy for AI tools to work with your code. Its open code and consistent API allow AI models to read, understand, and generate new components.

### MCP Server

The MCP (Model Context Protocol) server exposes Microbuild components to AI assistants like VS Code Copilot.

```bash
# Build the MCP server
cd packages/mcp-server
pnpm install
pnpm build
```

**Configure VS Code:**

Add to your VS Code `settings.json` or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "microbuild": {
        "command": "node",
        "args": [
          "/absolute/path/to/microbuild-ui-packages/packages/mcp-server/dist/index.js"
        ]
      }
    }
  }
}
```

**Usage with Copilot:**

- "List all Microbuild components"
- "Show me how to use the Input component"
- "Generate a CollectionForm for products"
- "Get the install command for input and datetime"

## Alternative Distribution Methods

### Workspace Protocol (Monorepo)

For projects within the same monorepo:

```json
{
  "dependencies": {
    "@microbuild/types": "workspace:*",
    "@microbuild/services": "workspace:*",
    "@microbuild/hooks": "workspace:*",
    "@microbuild/ui-interfaces": "workspace:*",
    "@microbuild/ui-collections": "workspace:*"
  }
}
```

### Git Dependencies

For external projects without publishing:

```json
{
  "dependencies": {
    "@microbuild/types": "github:yourorg/microbuild#packages/types"
  }
}
```

### GitHub Packages (Private Registry)

Publish to GitHub's private npm registry:

```bash
# Create .npmrc
echo "@microbuild:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc

# Publish
pnpm --filter @microbuild/types publish
```

## Comparison

| Method | Use Case | Best For |
|--------|----------|----------|
| **CLI** | Copy components as source | Teams that customize |
| **MCP Server** | AI-assisted development | VS Code Copilot users |
| **Workspace** | Monorepo development | Internal teams |
| **Git/npm** | Traditional package install | External distribution |

## Development

### Building

```bash
# Build CLI
pnpm build:cli

# Build MCP server
pnpm build:mcp

# Build all packages
pnpm build:packages
```

### Testing the CLI

```bash
# Initialize and add components
npx @microbuild/cli init
npx @microbuild/cli add input
npx @microbuild/cli list
```

### Testing the MCP Server

```bash
# Build and configure VS Code
pnpm build:mcp

# Reload VS Code after config changes
```

## Updating Components

Re-add a component with the overwrite flag:

```bash
npx @microbuild/cli add input --overwrite
```

Or manually edit the copied component in your project. Since you own the code, you can modify it however you need.

## Troubleshooting

### MCP Server Not Showing in VS Code

1. Check VS Code settings.json config
2. Verify absolute path to `index.js`
3. Ensure MCP server is built: `pnpm build:mcp`
4. Reload VS Code window
5. Check Output panel for MCP errors

### CLI Component Not Found

1. Check component name: `npx @microbuild/cli list`
2. Verify registry is up to date

### Type Errors After Install

1. Install peer dependencies: `pnpm add @mantine/core react`
2. Check tsconfig path aliases match `microbuild.json`
3. Restart TypeScript server in VS Code

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)
- [shadcn/ui (inspiration)](https://ui.shadcn.com)
