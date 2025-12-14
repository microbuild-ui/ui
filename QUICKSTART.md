# Quick Start: Using MCP Server & CLI

This guide will help you set up and use the Microbuild distribution tools.

## 🤖 Setup MCP Server for Claude Desktop

### Step 1: Build the MCP Server

```bash
cd /path/to/microbuild
pnpm build:mcp
```

### Step 2: Configure Claude Desktop

1. **Find your Claude Desktop config file:**

   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

2. **Edit the config file** and add:

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

**Important:** Replace `/absolute/path/to/microbuild` with the actual absolute path to your Microbuild directory.

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop for the changes to take effect.

### Step 4: Test with Claude

Ask Claude:

- "List all Microbuild components"
- "Show me how to use the Input component from Microbuild"
- "Generate a CollectionForm for a products collection"
- "Create a form with Input, SelectDropdown, and DateTime fields"

## 🛠️ Setup CLI Tool for Development

### Option 1: Use from Workspace (Development)

```bash
cd /path/to/microbuild
pnpm build:cli

# Create an alias for convenience
alias microbuild='node /path/to/microbuild/packages/cli/dist/index.js'

# Or use the pnpm script
pnpm cli list
pnpm cli init
```

### Option 2: Install Globally (Recommended)

```bash
cd /path/to/microbuild/packages/cli
pnpm build
pnpm install -g .

# Now you can use it anywhere
microbuild --help
```

### Option 3: Use via npx (Once Published)

```bash
# After publishing to npm or GitHub Packages
npx @microbuild/cli init
npx @microbuild/cli add input
```

## 📝 Using the CLI

### Initialize a Project

```bash
cd your-nextjs-app
microbuild init
```

This will:
- Create `microbuild.json` config
- Set up component directory structure
- Check for required dependencies

### Add Components

```bash
# Add single component
microbuild add input

# Add multiple components
microbuild add input select-dropdown datetime

# Add all components from a category
microbuild add --category selection

# Interactive selection
microbuild add
```

### List Available Components

```bash
# List all
microbuild list

# Filter by category
microbuild list --category input

# JSON output
microbuild list --json
```

## 🧪 Testing the Setup

### Test MCP Server

1. Build the server:
   ```bash
   pnpm build:mcp
   ```

2. Check the build output:
   ```bash
   ls -la packages/mcp-server/dist/
   ```

3. Test manually (should wait for stdin):
   ```bash
   node packages/mcp-server/dist/index.js
   # Press Ctrl+C to exit
   ```

4. Check Claude Desktop logs:
   ```bash
   # macOS
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

### Test CLI

1. Build the CLI:
   ```bash
   pnpm build:cli
   ```

2. Test list command:
   ```bash
   node packages/cli/dist/index.js list
   ```

3. Test in a sample project:
   ```bash
   # Create a test directory
   mkdir -p /tmp/test-microbuild
   cd /tmp/test-microbuild
   npm init -y
   
   # Initialize Microbuild
   node /path/to/microbuild/packages/cli/dist/index.js init --yes
   
   # Check generated files
   ls -la
   cat microbuild.json
   ```

## 🔄 Development Workflow

### When Making Changes to Components

```bash
# 1. Edit components in packages/ui-interfaces or packages/ui-collections
vim packages/ui-interfaces/src/input/index.tsx

# 2. Rebuild packages (if needed)
pnpm --filter @microbuild/ui-interfaces build

# 3. Rebuild MCP server (to pick up registry changes)
pnpm build:mcp

# 4. Rebuild CLI (to pick up registry changes)
pnpm build:cli

# 5. Test changes
pnpm cli list
```

### When Adding New Components

1. Create the component in `packages/ui-interfaces/src/`
2. Add metadata to `packages/mcp-server/src/registry.ts`
3. Add to CLI registry in `packages/cli/src/commands/add.ts` and `list.ts`
4. Rebuild both tools:
   ```bash
   pnpm build:mcp && pnpm build:cli
   ```

## 🐛 Troubleshooting

### MCP Server Issues

**Claude doesn't show Microbuild:**
- Check absolute path in config file
- Ensure server is built: `pnpm build:mcp`
- Check logs: `~/Library/Logs/Claude/mcp*.log`
- Restart Claude Desktop

**"Module not found" errors:**
- Run `pnpm install` in workspace root
- Rebuild: `pnpm build:mcp`

### CLI Issues

**"microbuild.json not found":**
- Run `microbuild init` first
- Check current directory

**Component not found:**
- Verify name with `microbuild list`
- Check registry is up to date

**TypeScript errors after adding component:**
- Install peer dependencies
- Check tsconfig path aliases
- Restart TypeScript server

## 📚 Next Steps

1. **For AI Development:**
   - Configure Claude Desktop with MCP server
   - Ask Claude to generate forms and components
   - Let AI discover and use your component library

2. **For Team Development:**
   - Share CLI installation instructions
   - Document custom components
   - Set up CI/CD for building packages

3. **For Production:**
   - Consider GitHub Packages for private npm registry
   - Set up automated builds
   - Document update procedures

## 📖 Additional Resources

- [DISTRIBUTION.md](./DISTRIBUTION.md) - Complete distribution guide
- [packages/mcp-server/README.md](./packages/mcp-server/README.md) - MCP server docs
- [packages/cli/README.md](./packages/cli/README.md) - CLI documentation
- [Model Context Protocol](https://modelcontextprotocol.io) - Official MCP docs
