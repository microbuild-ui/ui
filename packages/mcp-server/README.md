# @microbuild/mcp-server

Model Context Protocol (MCP) server for Microbuild components. Enables AI agents like VS Code Copilot to discover, understand, and generate code using the **Copy & Own** distribution model.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard that enables AI assistants to securely access external data sources and tools. This MCP server exposes the Microbuild component library to AI agents.

## Copy & Own Model

Microbuild uses the **Copy & Own** distribution model (similar to shadcn/ui):

- ✅ Components are copied as source code to your project
- ✅ Full customization - components become your application code
- ✅ No external package dependencies for component code
- ✅ No breaking changes from upstream updates
- ✅ Works offline after installation

## Features

- 📦 **Component Discovery** - List all available Microbuild components
- 📖 **Source Code Access** - Read component source code and documentation
- 🛠️ **Code Generation** - Generate components, forms, and interfaces
- 🔧 **CLI Integration** - Get CLI commands to install components
- 📚 **Usage Examples** - Get real-world usage examples with local imports

## Installation

### For VS Code Copilot

1. Install the MCP server:

```bash
cd packages/mcp-server
pnpm install
pnpm build
```

2. Add to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "microbuild": {
        "command": "node",
        "args": [
          "/absolute/path/to/microbuild/packages/mcp-server/dist/index.js"
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
  args: ["/path/to/microbuild/packages/mcp-server/dist/index.js"],
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

- `microbuild://packages/types` - TypeScript type definitions
- `microbuild://packages/services` - CRUD service classes
- `microbuild://packages/hooks` - React hooks for relations
- `microbuild://packages/ui-interfaces` - Field interface components
- `microbuild://packages/ui-collections` - Dynamic collection components

### Components

- `microbuild://components/Input` - Text input component
- `microbuild://components/SelectDropdown` - Dropdown select
- `microbuild://components/DateTime` - Date/time picker
- `microbuild://components/FileImage` - Image upload
- `microbuild://components/CollectionForm` - Dynamic form
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

## Usage with Copilot

Once configured, you can ask Copilot:

- "How do I install Microbuild components?" (uses `get_copy_own_info`)
- "Add the Input and SelectDropdown components to my project" (uses `get_install_command`)
- "Show me how to use the Input component" (uses `get_usage_example`)
- "Generate a form for a products collection" (uses `generate_form`)
- "List all available selection components" (uses `list_components`)
- "Show me the source code for CollectionForm" (uses `get_component`)

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
│       @microbuild/mcp-server            │
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
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Component Registry (JSON)       │   │
│  │  - Metadata & Categories         │   │
│  │  - Dependencies                  │   │
│  │  - File mappings                 │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Microbuild CLI                  │
│  npx @microbuild/cli add <components>   │
│  - Copies source to user project        │
│  - Transforms imports                   │
│  - Resolves dependencies                │
└─────────────────────────────────────────┘
```

## License

MIT
