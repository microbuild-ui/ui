# @buildpad/mcp

Model Context Protocol (MCP) server for Buildpad components. Enables AI agents like VS Code Copilot to discover, understand, and generate code using the **Copy & Own** distribution model.

[![npm version](https://img.shields.io/npm/v/@buildpad/mcp)](https://www.npmjs.com/package/@buildpad/mcp)

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard that enables AI assistants to securely access external data sources and tools. This MCP server exposes the Buildpad component library to AI agents.

## Copy & Own Model

Buildpad uses the **Copy & Own** distribution model (similar to shadcn/ui):

- ✅ Components are copied as source code to your project
- ✅ Full customization - components become your application code
- ✅ No external package dependencies for component code
- ✅ No breaking changes from upstream updates
- ✅ Works offline after installation

## Features

- 📦 **Component Discovery** - List all available Buildpad components
- 📖 **Source Code Access** - Read component source code and documentation
- 🛠️ **Code Generation** - Generate components, forms, and interfaces
- 🔧 **CLI Integration** - Get CLI commands to install components
- 📚 **Usage Examples** - Get real-world usage examples with local imports

## Installation

### For VS Code Copilot (Recommended — via npx)

The MCP server is published on npm. No local build required.

Add to your VS Code `settings.json` or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "buildpad": {
        "command": "npx",
        "args": ["@buildpad/mcp@latest"]
      }
    }
  }
}
```

Reload VS Code window.

### For VS Code Copilot (Local build)

For development within the monorepo:

1. Build the MCP server:

```bash
pnpm build:mcp
```

2. Add to your VS Code `settings.json` or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "buildpad": {
        "command": "node",
        "args": [
          "/absolute/path/to/buildpad-ui/packages/mcp-server/dist/index.js"
        ]
      }
    }
  }
}
```

3. Reload VS Code window

### For Other AI Agents

Use any MCP-compatible client:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["/path/to/buildpad-ui/packages/mcp-server/dist/index.js"],
});

const client = new Client({
  name: "my-app",
  version: "1.0.0",
}, {
  capabilities: {},
});

await client.connect(transport);
```

## Available Resources

### Packages

- `buildpad://packages/types` - TypeScript type definitions
- `buildpad://packages/services` - CRUD service classes
- `buildpad://packages/hooks` - React hooks for relations
- `buildpad://packages/ui-interfaces` - Field interface components
- `buildpad://packages/ui-collections` - Dynamic collection components

### Components

- `buildpad://components/Input` - Text input component
- `buildpad://components/SelectDropdown` - Dropdown select
- `buildpad://components/DateTime` - Date/time picker
- `buildpad://components/FileImage` - Image upload
- `buildpad://components/CollectionForm` - Dynamic form
- ... and many more

## Available Tools

### `list_components`

List all available components with descriptions and categories.

### `get_component`

Get detailed information and source code for a specific component.

```json
{
  "name": "Input"
}
```

### `list_packages`

List all Buildpad packages with their exports.

### `get_install_command`

Get the CLI command to install components. Essential for AI agents to help users add components.

```json
{
  "components": ["input", "select-dropdown", "datetime"]
}
```

Or install by category:

```json
{
  "category": "selection"
}
```

### `get_copy_own_info`

Get detailed information about the Copy & Own distribution model.

### `copy_component`

Get complete source code and file structure to manually copy a component into your project (shadcn-style). Returns the full implementation code, target paths, and required dependencies.

```json
{
  "name": "datetime",
  "includeLib": true
}
```

Returns:
- Full component source code
- Target file paths
- Required lib modules (types, services, hooks)
- Peer dependencies to install
- Copy instructions

### `generate_form`

Generate a CollectionForm component with specified configuration.

```json
{
  "collection": "products",
  "fields": ["title", "description", "price"],
  "mode": "create"
}
```

### `generate_interface`

Generate a field interface component.

```json
{
  "type": "input",
  "field": "title",
  "props": {
    "placeholder": "Enter title",
    "required": true
  }
}
```

### `get_usage_example`

Get real-world usage examples for a component (with local imports).

```json
{
  "component": "SelectDropdown"
}
```

### `get_rbac_pattern`

Get RBAC (Role-Based Access Control) setup patterns for DaaS applications. Returns step-by-step MCP tool call sequences to set up roles, policies, access, and permissions.

```json
{
  "pattern": "own_items",
  "collections": ["articles", "categories"],
  "roleName": "Editor"
}
```

**Available patterns:**
| Pattern | Description |
|---------|-------------|
| `own_items` | Users manage their own records, read others' published items |
| `role_hierarchy` | Admin > Editor > Viewer cascading permissions |
| `public_read` | Public read + authenticated write |
| `multi_tenant` | Organization-level data isolation |
| `full_crud` | Unrestricted CRUD access |
| `read_only` | Read-only access |

**Dynamic variables supported:** `$CURRENT_USER`, `$CURRENT_USER.<field>`, `$CURRENT_ROLE`, `$CURRENT_ROLES`, `$CURRENT_POLICIES`, `$NOW`

## Usage with Copilot

Once configured, you can ask Copilot:

- "How do I install Buildpad components?" (uses `get_copy_own_info`)
- "Add the Input and SelectDropdown components to my project" (uses `get_install_command`)
- "Show me how to use the Input component" (uses `get_usage_example`)
- "Generate a form for a products collection" (uses `generate_form`)
- "List all available selection components" (uses `list_components`)
- "Show me the source code for CollectionForm" (uses `get_component`)
- "Set up RBAC with own_items pattern for articles" (uses `get_rbac_pattern`)
- "Generate role hierarchy for Admin, Editor, Viewer" (uses `get_rbac_pattern`)

The AI agent will provide CLI commands that you can run to install components.

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## Architecture

```
┌─────────────────────────────────────────┐
│      AI Agent (VS Code Copilot, etc.)   │
└────────────────┬────────────────────────┘
                 │ MCP Protocol
┌────────────────▼────────────────────────┐
│       @buildpad/mcp                   │
│  ┌──────────────────────────────────┐   │
│  │  Resource Handlers               │   │
│  │  - List components               │   │
│  │  - Read component source         │   │
│  │  - Get documentation             │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Tool Handlers                   │   │
│  │  - get_install_command           │   │
│  │  - get_copy_own_info             │   │
│  │  - generate_form                 │   │
│  │  - generate_interface            │   │
│  │  - get_usage_example             │   │
│  │  - get_rbac_pattern              │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Component Registry (embedded)   │   │
│  │  - Metadata & Categories         │   │
│  │  - Dependencies                  │   │
│  │  - File mappings                 │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         @buildpad/cli (npm)           │
│  npx @buildpad/cli@latest add <comp>  │
│  - Fetches source from GitHub CDN       │
│  - Transforms imports                   │
│  - Resolves dependencies                │
│  - Copies to user project               │
└─────────────────────────────────────────┘
```

## License

MIT
