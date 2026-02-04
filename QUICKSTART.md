# Quick Start: Using MCP Server & CLI

This guide will help you set up and use the Microbuild UI Packages distribution tools.

## 🤖 Setup MCP Server for VS Code Copilot

### Step 1: Build the MCP Server

```bash
cd /path/to/microbuild-ui-packages
pnpm build:mcp
```

### Step 2: Configure VS Code

1. **Open VS Code Settings:**

   - Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Preferences: Open User Settings (JSON)"

2. **Add MCP server configuration:**

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

**Important:** Replace `/absolute/path/to/microbuild-ui-packages` with the actual absolute path to your Microbuild directory.

### Step 3: Reload VS Code

Reload the VS Code window for the changes to take effect (`Cmd+Shift+P` → "Developer: Reload Window").

### Step 4: Test with Copilot

Ask Copilot:

- "List all Microbuild components"
- "Show me how to use the Input component from Microbuild"
- "Generate a CollectionForm for a products collection"
- "Create a form with Input, SelectDropdown, and DateTime fields"

## 🛠️ Setup CLI Tool for Development

### Option 1: Use from Workspace (Development)

```bash
cd /path/to/microbuild-ui-packages
pnpm build:cli

# Create an alias for convenience
alias microbuild='node /path/to/microbuild-ui-packages/packages/cli/dist/index.js'

# Or use the pnpm script
pnpm cli list
pnpm cli init
```

### Option 2: Install Globally (Recommended)

```bash
cd /path/to/microbuild-ui-packages/packages/cli
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

# Add collection-form (includes VForm + all 32 interface components)
microbuild add collection-form

# Add all components from a category
microbuild add --category selection

# Interactive selection
microbuild add
```

**Note:** When you add `collection-form`, it automatically includes:
- **VForm** - Dynamic form component that renders any field type
- **32 interface components** - All field types (input, select, datetime, M2M, M2O, etc.)
- **Lib modules** - types, services, hooks, and field-interface-mapper utilities

### List Available Components

```bash
# List all
microbuild list

# Filter by category
microbuild list --category input

# JSON output
microbuild list --json
```

### Check Installed Components

```bash
# View installed components and their origins
microbuild status

# JSON output for scripting
microbuild status --json
```

The status command shows:
- Which components are installed
- Their versions and installation dates
- Origin tracking for updates

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

4. Check VS Code Output panel:
   - Open Output panel (`Cmd+Shift+U` or `Ctrl+Shift+U`)
   - Select "MCP" from the dropdown to see server logs

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
   node /path/to/microbuild-ui-packages/packages/cli/dist/index.js init --yes
   
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

## 🧪 Testing

Microbuild uses Playwright for E2E testing with a two-tier strategy.

### Storybook Component Tests (Recommended for development)

```bash
# Terminal 1: Start VForm Storybook
pnpm storybook:form

# Terminal 2: Run Playwright tests
pnpm test:storybook
```

Storybook tests:
- ✅ **Isolated** - No authentication required
- ✅ **Fast** - Test components with mocked data
- ✅ **All interface types** - Test any field configuration
- ✅ **DaaS Playground** - Connect to real DaaS and test live schemas

**DaaS Playground with Proxy Mode (Recommended):**

Start Storybook with DaaS environment variables to enable API proxying (no CORS issues):

```bash
# Create .env.local file in packages/ui-form/
STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com
STORYBOOK_DAAS_TOKEN=your-static-token

# Or pass env vars directly
STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \
STORYBOOK_DAAS_TOKEN=your-token \
pnpm storybook:form
```

This enables a Vite proxy that forwards `/api/*` requests to DaaS, allowing all relational interfaces (M2O, O2M, M2M, M2A) to work correctly.

**DaaS Playground Features:**
- **Authentication Display**: Shows current user info and admin status
- **Permission Enforcement**: Test field-level permissions (create/update/read actions)
- **Login Support**: Authenticate with email/password or static token
- **Real-time Testing**: Test with actual collection schemas and data

**DaaS Playground Usage:**
1. Start Storybook with proxy config (see above)
2. Navigate to "Forms/VForm DaaS Playground" → "Playground" story
3. Optionally login with email/password for JWT authentication
4. Select a collection from the dropdown
5. Enable "Enforce Field Permissions" to test permission filtering
6. Test VForm with real fields including relational interfaces

### DaaS E2E Tests (Full integration testing)

```bash
# Prerequisites:
# 1. Configure .env.local with DaaS credentials
# 2. Install Playwright browsers
pnpm exec playwright install chromium

# Run E2E tests against DaaS
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# Test specific suite
pnpm test:e2e tests/ui-form/vform.spec.ts
```

DaaS tests:
- ✅ **Real API** - Actual Supabase backend
- ✅ **Authentication** - Test with real users/roles
- ✅ **Permissions** - Verify field-level access
- ✅ **Data Seeding** - Automated test data creation/cleanup

**Test Organization:**
```
tests/
├── auth.setup.ts               # Auth setup (runs once)
├── helpers/
│   └── seed-test-data.ts       # Test data seeding utilities
└── ui-form/
    ├── vform-storybook.spec.ts # Storybook component tests
    ├── vform-daas.spec.ts      # DaaS integration tests
    └── vform.spec.ts           # Full E2E workflow tests
```

See [docs/TESTING.md](./docs/TESTING.md) for complete testing guide and best practices.

## 🐛 Troubleshooting

### MCP Server Issues

**VS Code doesn't show Microbuild MCP:**
- Check absolute path in settings.json
- Ensure server is built: `pnpm build:mcp`
- Check Output panel for MCP errors
- Reload VS Code window

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
   - Configure VS Code with MCP server
   - Ask Copilot to generate forms and components
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

- [docs/DISTRIBUTION.md](./docs/DISTRIBUTION.md) - Complete distribution guide
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture diagrams
- [docs/TESTING.md](./docs/TESTING.md) - Playwright E2E testing guide
- [packages/mcp-server/README.md](./packages/mcp-server/README.md) - MCP server docs
- [packages/cli/README.md](./packages/cli/README.md) - CLI documentation
- [packages/ui-form/README.md](./packages/ui-form/README.md) - VForm component docs
- [Model Context Protocol](https://modelcontextprotocol.io) - Official MCP docs
