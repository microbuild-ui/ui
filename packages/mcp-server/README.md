# @microbuild/mcp-server

Model Context Protocol (MCP) server for Microbuild components. Enables AI agents like Claude to discover, understand, and generate code using Microbuild packages.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard that enables AI assistants to securely access external data sources and tools. This MCP server exposes the Microbuild component library to AI agents.

## Features

- 📦 **Component Discovery** - List all available Microbuild packages and components
- 📖 **Source Code Access** - Read component source code and documentation
- 🛠️ **Code Generation** - Generate components, forms, and interfaces
- 🔍 **Type Definitions** - Access TypeScript types and interfaces
- 📚 **Usage Examples** - Get real-world usage examples

## Installation

### For Claude Desktop

1. Install the MCP server:

```bash
cd packages/mcp-server
pnpm install
pnpm build
```

2. Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "microbuild": {
      "command": "node",
      "args": [
        "/absolute/path/to/microbuild/packages/mcp-server/dist/index.js"
      ]
    }
  }
}
```

3. Restart Claude Desktop

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

Get the source code and documentation for a specific component.

```json
{
  "name": "Input",
  "package": "@microbuild/ui-interfaces"
}
```

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

Get real-world usage examples for a component.

```json
{
  "component": "SelectDropdown",
  "scenario": "form"
}
```

## Usage with Claude

Once configured, you can ask Claude:

- "Show me how to use the Input component from Microbuild"
- "Generate a CollectionForm for a products collection"
- "List all available Microbuild components"
- "Create a form with Input, SelectDropdown, and DateTime"
- "Show me examples of using the M2M relation hook"

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
│         AI Agent (Claude, etc.)         │
└────────────────┬────────────────────────┘
                 │ MCP Protocol
┌────────────────▼────────────────────────┐
│       @microbuild/mcp-server            │
│  ┌──────────────────────────────────┐   │
│  │  Resource Handlers               │   │
│  │  - List packages                 │   │
│  │  - Read component source         │   │
│  │  - Get documentation             │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Tool Handlers                   │   │
│  │  - generate_form                 │   │
│  │  - generate_interface            │   │
│  │  - get_usage_example             │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Component Registry              │   │
│  │  - Metadata                      │   │
│  │  - Categories                    │   │
│  │  - Dependencies                  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Microbuild Packages (Source)       │
│  - types, services, hooks, ui-*         │
└─────────────────────────────────────────┘
```

## License

MIT
