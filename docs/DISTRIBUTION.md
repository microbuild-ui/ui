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

# 3. Or bootstrap everything at once (recommended for AI agents)
npx @microbuild/cli bootstrap

# 4. Use in your code
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
├── app/
│   ├── api/
│   │   ├── auth/                        # Auth proxy routes (installed by CLI)
│   │   │   ├── login/route.ts           # POST - Supabase login
│   │   │   ├── logout/route.ts          # POST - Sign out
│   │   │   ├── user/route.ts            # GET - Current user info
│   │   │   └── callback/route.ts        # GET - OAuth callback
│   │   ├── fields/[collection]/route.ts # Fields proxy
│   │   ├── items/[collection]/route.ts  # Items proxy
│   │   └── ...
│   └── login/page.tsx                   # Login page template
├── src/
│   ├── components/
│   │   └── ui/                      # UI components
│   │       ├── input.tsx
│   │       ├── select-dropdown.tsx
│   │       ├── datetime.tsx
│   │       └── vform/               # VForm component (when using collection-form)
│   │           ├── VForm.tsx
│   │           ├── components/
│   │           └── utils/
│   └── lib/
│       ├── microbuild/              # Lib modules (auto-resolved)
│       │   ├── utils.ts
│       │   ├── field-interface-mapper.ts
│       │   ├── types/
│       │   ├── services/
│       │   └── hooks/
│       ├── api/auth-headers.ts      # Auth header utilities
│       └── supabase/                # Supabase client utilities
│           ├── server.ts
│           └── client.ts
├── middleware.ts                     # Auth middleware
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

The MCP server is published as [`@microbuild/mcp`](https://www.npmjs.com/package/@microbuild/mcp) on npm.

**Configure VS Code (Recommended — via npx):**

Add to your VS Code `settings.json` or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "microbuild": {
        "command": "npx",
        "args": ["@microbuild/mcp@latest"]
      }
    }
  }
}
```

**Configure VS Code (Local build — for development):**

```bash
# Build the MCP server
pnpm build:mcp
```

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

For private distribution, you can publish to GitHub's private npm registry.
Note: The CLI and MCP server are already published publicly at `@microbuild/cli` and `@microbuild/mcp` on npmjs.com.

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
| **CLI (npx)** | Copy components as source | Teams that customize |
| **MCP Server (npx)** | AI-assisted development | VS Code Copilot users |
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

## Hosting Storybook on AWS Amplify

You can deploy all three Storybooks (ui-interfaces, ui-form, ui-table) as a single static site on AWS Amplify.

### What Gets Deployed

| Path | Package | Content |
|------|---------|---------|
| `/` | — | Landing page with links to all three |
| `/interfaces/` | `@microbuild/ui-interfaces` | 40+ field interface components |
| `/form/` | `@microbuild/ui-form` | VForm dynamic form component |
| `/table/` | `@microbuild/ui-table` | VTable dynamic table component |

### Setup

1. **Connect repo:** AWS Amplify Console → **Host web app** → GitHub → select `microbuild-ui/ui`, branch `main`
2. **Build settings:** Amplify auto-detects [amplify.yml](../amplify.yml) — no manual config needed
3. **Deploy:** Click **Save and deploy** → get a CDN URL like `https://main.d1234abcdef.amplifyapp.com`

The build spec installs pnpm via corepack, runs `pnpm install --frozen-lockfile`, then `bash scripts/build-storybooks.sh` which builds all 3 Storybooks into `storybook-dist/`.

### Environment Variables (optional)

To enable the VForm DaaS Playground on the hosted site, add in Amplify Console → Environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `STORYBOOK_DAAS_URL` | `https://xxx.microbuild-daas.xtremax.com` | No |
| `STORYBOOK_DAAS_TOKEN` | Your static token | No |

Without these, Storybooks still work — the DaaS Playground stories just won't connect to a live backend.

### Local Preview

```bash
# Build all Storybooks
pnpm build:storybook

# Preview
npx serve storybook-dist
```

### Build Image & Node Version

Use **Amazon Linux 2023** (default). If builds fail due to Node version, add a `.nvmrc` file with `20`.

### Custom Domain

Amplify Console → Domain management → **Add domain** → follow DNS verification. Free SSL included.

### Amplify Troubleshooting

- **Out of memory:** Increase compute to **Large** (7 GB) or add `export NODE_OPTIONS="--max-old-space-size=4096"` to preBuild
- **pnpm not found:** Ensure preBuild has `corepack enable && corepack prepare pnpm@10.17.0 --activate`
- **Blank page:** Verify `baseDirectory: storybook-dist` in `amplify.yml`
- **DaaS Playground not connecting:** The Vite proxy only works in dev mode; static builds need CORS configured on DaaS
