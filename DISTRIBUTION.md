# Microbuild Distribution Guide

This guide explains how to distribute and use Microbuild packages without publishing to npm.

## Distribution Methods

### 1. Model Context Protocol (MCP) Server - For AI Agents

The MCP server exposes Microbuild components to AI assistants like Claude Desktop.

**Setup:**

```bash
# Build the MCP server
cd packages/mcp-server
pnpm install
pnpm build

# Configure Claude Desktop
# Edit: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
# Edit: %APPDATA%/Claude/claude_desktop_config.json (Windows)
```

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

**Usage with Claude:**
- "List all Microbuild components"
- "Show me how to use the Input component"
- "Generate a CollectionForm for products"
- "Create a form with Input, SelectDropdown, and DateTime"

### 2. CLI Tool - For Developers

The CLI tool copies component source code directly into projects (like shadcn/ui).

**Installation:**

```bash
# Build the CLI
cd packages/cli
pnpm install
pnpm build

# Install globally (optional)
pnpm install -g .

# Or use via pnpm from workspace root
pnpm cli init
```

**Usage:**

```bash
# Initialize in your project
cd your-nextjs-app
microbuild init

# Add components
microbuild add input select-dropdown datetime

# List available components
microbuild list

# Add by category
microbuild add --category selection
```

### 3. Private Git Repository

Use Git URLs in package.json for workspace dependencies.

**For monorepo (current setup):**

Your `main-nextjs` and `nextjs-supabase-daas` projects already use workspace protocol:

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

**For external projects:**

```json
{
  "dependencies": {
    "@microbuild/types": "git+ssh://git@github.com/yourorg/microbuild.git#workspace=packages/types",
    "@microbuild/services": "git+ssh://git@github.com/yourorg/microbuild.git#workspace=packages/services"
  }
}
```

### 4. GitHub Packages (Private npm Registry)

Publish to GitHub's private registry while keeping code private.

**Setup:**

```bash
# Create .npmrc in workspace root
echo "@microbuild:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc

# Add publishConfig to each package's package.json
```

```json
{
  "name": "@microbuild/types",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

**Publish:**

```bash
# Set GitHub token
export GITHUB_TOKEN=your_token_here

# Publish packages
pnpm --filter @microbuild/types publish
pnpm --filter @microbuild/services publish
# ... etc
```

**Install in projects:**

```bash
# Configure .npmrc in consuming project
echo "@microbuild:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc

# Install packages
pnpm add @microbuild/types @microbuild/services
```

## Comparison Matrix

| Method | Use Case | Pros | Cons | Best For |
|--------|----------|------|------|----------|
| **MCP Server** | AI agents | - Works with Claude/AI<br>- No setup for users<br>- Always up-to-date | - Requires MCP support | AI-assisted development |
| **CLI Tool** | Developers | - Full source control<br>- No version lock<br>- Easy customization | - Manual updates<br>- No semantic versioning | Teams that customize |
| **Workspace** | Monorepo | - Fast dev experience<br>- Single source of truth<br>- Type safety | - All projects in one repo | Internal teams |
| **Git URLs** | External projects | - Private code<br>- Version via tags<br>- No npm needed | - Slower installs<br>- Requires build step | Small teams |
| **GitHub Packages** | Enterprise | - Full npm compat<br>- Fast installs<br>- Semantic versioning | - Requires GitHub auth<br>- "Publishing" step | Large organizations |

## Recommended Setup

### For Internal Development (Current)

**Keep using the monorepo setup:**

```
microbuild/
├── packages/           # Shared packages
├── main-nextjs/       # App 1
└── nextjs-supabase-daas/  # App 2
```

**Benefits:**
- Fast development with `workspace:*` protocol
- Single pnpm install
- Shared dependencies
- Type safety across projects

### For AI-Assisted Development

**Add MCP Server:**

1. Build MCP server: `pnpm build:mcp`
2. Configure Claude Desktop with absolute path
3. Ask Claude to help build features using Microbuild

### For External Projects

**Use CLI tool:**

```bash
# In external Next.js project
npx @microbuild/cli init
npx @microbuild/cli add collection-form input datetime

# Components copied to your project
# Full control, no version dependencies
```

**Or use Git dependencies:**

```json
{
  "dependencies": {
    "@microbuild/types": "github:yourorg/microbuild#packages/types",
    "@microbuild/ui-interfaces": "github:yourorg/microbuild#packages/ui-interfaces"
  }
}
```

## Development Workflow

### Building Packages

```bash
# Build all packages
pnpm build:packages

# Build specific package
pnpm --filter @microbuild/types build

# Build MCP server
pnpm build:mcp

# Build CLI
pnpm build:cli
```

### Testing the CLI

```bash
# Build and test locally
pnpm cli init
pnpm cli list
pnpm cli add input
```

### Testing the MCP Server

```bash
# Start in dev mode
pnpm mcp:dev

# Test with Claude Desktop (restart Claude after config changes)
```

### Publishing Updates

**For GitHub Packages:**

```bash
# 1. Update version in package.json
# 2. Commit changes
# 3. Tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push --tags

# 4. Publish
pnpm --filter @microbuild/types publish
```

**For Git-based installs:**

```bash
# Just push to GitHub
git push

# Users update with:
pnpm update @microbuild/types
```

## Security Considerations

### Private Repository Access

- Use SSH keys for Git URLs: `git+ssh://git@github.com/...`
- Use GitHub tokens for HTTPS: `git+https://${GITHUB_TOKEN}@github.com/...`
- Store tokens in `.npmrc` (add to `.gitignore`)

### GitHub Packages Access

- Create GitHub Personal Access Token with `read:packages` scope
- Store in environment variable: `GITHUB_TOKEN`
- Add `.npmrc` to `.gitignore`

### MCP Server Security

- MCP server runs locally (no network exposure)
- Only accessible by configured AI clients
- Source code remains on your machine

## Updating Components

### In Monorepo

```bash
# Make changes to packages
cd packages/ui-interfaces/src/input
# ... edit ...

# Apps automatically pick up changes
pnpm dev  # in main-nextjs or nextjs-supabase-daas
```

### Via CLI (External Projects)

```bash
# Re-add component with overwrite flag
microbuild add input --overwrite

# Or manually edit the copied component
```

### Via Git Dependencies

```bash
# Pull latest changes
pnpm update @microbuild/types
pnpm update @microbuild/ui-interfaces
```

## Troubleshooting

### MCP Server Not Showing in Claude

1. Check Claude Desktop config path
2. Verify absolute path to `index.js`
3. Ensure MCP server is built: `pnpm build:mcp`
4. Restart Claude Desktop
5. Check logs: `~/Library/Logs/Claude/mcp*.log`

### CLI Component Not Found

1. Check component name: `microbuild list`
2. Verify registry is up to date
3. Check workspace root path in CLI code

### Git Dependencies Not Installing

1. Verify Git credentials (SSH keys or tokens)
2. Check repository access permissions
3. Ensure package has `prepare` script for building

### Type Errors After Install

1. Install peer dependencies: `pnpm add @mantine/core react`
2. Check tsconfig path aliases
3. Restart TypeScript server in VS Code

## Next Steps

1. ✅ **MCP Server** - Set up Claude Desktop integration
2. ✅ **CLI Tool** - Build and test locally
3. 🔄 **Documentation Site** - Create public docs (optional)
4. 🔄 **GitHub Packages** - Set up private registry (optional)
5. 🔄 **CI/CD** - Automate builds and publishing (optional)

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)
- [GitHub Packages Documentation](https://docs.github.com/packages)
- [shadcn/ui (inspiration)](https://ui.shadcn.com)
