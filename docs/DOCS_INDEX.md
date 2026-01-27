# Microbuild UI Packages Documentation Index

Complete guide to Microbuild UI Packages and distribution tools.

## 📚 Documentation Overview

| Document | Description | Audience |
|----------|-------------|----------|
| [README.md](../README.md) | Workspace overview and quick start | All users |
| [QUICKSTART.md](../QUICKSTART.md) | Setup guide for MCP & CLI | New users |
| [DISTRIBUTION.md](DISTRIBUTION.md) | Complete distribution guide | DevOps/Teams |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture diagrams | Technical users |

## 🎯 Quick Navigation

### Getting Started
- [Installation](../README.md#-quick-start) - Install dependencies and build
- [Quick Start](../QUICKSTART.md) - Set up MCP server or CLI
- [Packages Overview](../packages/README.md) - Available packages

### For Developers
- [CLI Tool Guide](../packages/cli/README.md) - Use CLI to add components
- [Component List](../packages/README.md#package-details) - All available components
- [Usage Examples](../packages/README.md#quick-start) - Code examples

### For AI Development
- [MCP Server Setup](../QUICKSTART.md#-setup-mcp-server-for-vs-code-copilot) - VS Code Copilot integration
- [MCP Documentation](../packages/mcp-server/README.md) - MCP server details
- [Available Tools](../packages/mcp-server/README.md#available-tools) - AI tools reference

### For Teams
- [Distribution Methods](DISTRIBUTION.md#distribution-methods) - How to distribute
- [Comparison Matrix](DISTRIBUTION.md#comparison-matrix) - Choose the right method
- [Security](DISTRIBUTION.md#security-considerations) - Keep code private

### Technical Reference
- [Architecture](ARCHITECTURE.md) - System diagrams
- [Registry](../packages/registry.json) - Component metadata
- [Build Commands](../README.md#-workspace-commands) - Build instructions

## 📦 Package Documentation

| Package | Description | Documentation |
|---------|-------------|---------------|
| @microbuild/types | TypeScript types | [README](../packages/types/README.md) |
| @microbuild/services | CRUD & permissions services | [README](../packages/services/README.md) |
| @microbuild/hooks | React hooks (relations, UI state, versioning, workflow) | [README](../packages/hooks/README.md) |
| @microbuild/utils | Field interface mapper & utilities | [README](../packages/utils/README.md) |
| @microbuild/ui-interfaces | Field components | [README](../packages/ui-interfaces/README.md) |
| @microbuild/ui-collections | Collection components | [README](../packages/ui-collections/README.md) |
| @microbuild/mcp-server | MCP server | [README](../packages/mcp-server/README.md) |
| @microbuild/cli | CLI tool | [README](../packages/cli/README.md) |

## 🚀 Common Tasks

### Setup Tasks

| Task | Command | Documentation |
|------|---------|---------------|
| Install dependencies | `pnpm install` | [README.md](../README.md#setup) |
| Build all packages | `pnpm build` | [README.md](../README.md#development) |
| Build MCP server | `pnpm build:mcp` | [QUICKSTART.md](../QUICKSTART.md#step-1-build-the-mcp-server) |
| Build CLI tool | `pnpm build:cli` | [QUICKSTART.md](../QUICKSTART.md#option-1-use-from-workspace-development) |
| Run Storybook | `pnpm storybook` | [packages/README.md](../packages/README.md#storybook) |

### Development Tasks

| Task | Command | Documentation |
|------|---------|---------------|
| Start dev servers | `pnpm dev` | [README.md](../README.md#development) |
| MCP dev mode | `pnpm mcp:dev` | [QUICKSTART.md](../QUICKSTART.md#-development-workflow) |
| Run CLI locally | `pnpm cli list` | [QUICKSTART.md](../QUICKSTART.md#test-cli) |
| Type check | `pnpm -r typecheck` | [packages/README.md](../packages/README.md#scripts) |

### Distribution Tasks

| Task | Command | Documentation |
|------|---------|---------------|
| List components | `microbuild list` | [packages/cli/README.md](../packages/cli/README.md#list) |
| Add component | `microbuild add input` | [packages/cli/README.md](../packages/cli/README.md#add) |
| Initialize project | `microbuild init` | [packages/cli/README.md](../packages/cli/README.md#init) |
| Check status | `microbuild status` | [packages/cli/README.md](../packages/cli/README.md#status) |

## 🎨 Component Categories

### Input Components
- [Input](../packages/README.md#microbuildui-interfaces) - Text input with validation
- [Textarea](../packages/README.md#microbuildui-interfaces) - Multi-line text
- [InputCode](../packages/README.md#microbuildui-interfaces) - Code editor
- [Tags](../packages/README.md#microbuildui-interfaces) - Tag input

### Selection Components
- [SelectDropdown](../packages/README.md#microbuildui-interfaces) - Dropdown select
- [SelectRadio](../packages/README.md#microbuildui-interfaces) - Radio buttons
- [SelectMultipleCheckbox](../packages/README.md#microbuildui-interfaces) - Checkboxes
- [SelectIcon](../packages/README.md#microbuildui-interfaces) - Icon picker
- [AutocompleteAPI](../packages/README.md#microbuildui-interfaces) - API autocomplete
- [CollectionItemDropdown](../packages/README.md#microbuildui-interfaces) - Item selector

### Media Components
- [FileInterface](../packages/README.md#microbuildui-interfaces) - Single file upload
- [FileImage](../packages/README.md#microbuildui-interfaces) - Image picker
- [Files](../packages/README.md#microbuildui-interfaces) - Multi-file upload
- [Upload](../packages/README.md#microbuildui-interfaces) - Drag-drop upload
- [Color](../packages/README.md#microbuildui-interfaces) - Color picker

### Relational Components
- [ListM2M](../packages/README.md#microbuildui-interfaces) - Many-to-Many
- [ListM2O](../packages/README.md#microbuildui-interfaces) - Many-to-One
- [ListO2M](../packages/README.md#microbuildui-interfaces) - One-to-Many
- [ListM2A](../packages/README.md#microbuildui-interfaces) - Many-to-Any

### Workflow Components
- [WorkflowButton](../packages/README.md#microbuildui-interfaces) - State transitions with policy-based commands

### Collection Components
- [CollectionForm](../packages/README.md#microbuildui-collections) - Dynamic form
- [CollectionList](../packages/README.md#microbuildui-collections) - Dynamic list/table

[See all 33 components →](../packages/README.md#microbuildui-interfaces)

## 🔍 How-To Guides

### Setup Guides
1. [Set up MCP Server for VS Code](../QUICKSTART.md#-setup-mcp-server-for-vs-code-copilot)
2. [Set up CLI Tool](../QUICKSTART.md#-setup-cli-tool-for-development)
3. [Initialize a New Project](../packages/cli/README.md#initialize-microbuild-in-your-project)
4. [Configure Path Aliases](../packages/cli/README.md#configuration)

### Usage Guides
1. [Add Components to Project](../packages/cli/README.md#add-components)
2. [Use with VS Code Copilot](../packages/mcp-server/README.md#usage-with-copilot)
3. [Build Custom Forms](../packages/README.md#5-use-dynamic-collection-components)
4. [Manage Relations](../packages/README.md#3-use-relation-hooks)

### Distribution Guides
1. [Choose Distribution Method](DISTRIBUTION.md#comparison-matrix)
2. [Set up GitHub Packages](DISTRIBUTION.md#4-github-packages-private-npm-registry)
3. [Use Git URLs](DISTRIBUTION.md#3-private-git-repository)
4. [Share with Team](DISTRIBUTION.md#recommended-setup)

### Troubleshooting
1. [MCP Server Issues](../QUICKSTART.md#mcp-server-issues)
2. [CLI Issues](../QUICKSTART.md#cli-issues)
3. [Build Problems](../QUICKSTART.md#-troubleshooting)
4. [Type Errors](DISTRIBUTION.md#type-errors-after-install)

## 🎓 Learning Path

### For New Users
1. Read [README.md](../README.md) - Understand the workspace
2. Follow [QUICKSTART.md](../QUICKSTART.md) - Set up your first tool
3. Explore [packages/README.md](../packages/README.md) - Learn about packages
4. Try examples in package documentation

### For Developers
1. Read [packages/README.md](../packages/README.md) - Understand packages
2. Set up [CLI Tool](../QUICKSTART.md#-setup-cli-tool-for-development)
3. Add components to a project
4. Customize and build

### For AI-Assisted Development
1. Read [MCP Server README](../packages/mcp-server/README.md)
2. Set up [VS Code Copilot](../QUICKSTART.md#-setup-mcp-server-for-vs-code-copilot)
3. Ask Copilot to help build features
4. Iterate with AI assistance

### For Teams
1. Read [DISTRIBUTION.md](DISTRIBUTION.md) - Understand options
2. Choose distribution method
3. Set up infrastructure
4. Document for team

## 🏗️ Architecture

```
Microbuild Architecture

┌─────────────────────────────────────┐
│      Distribution Layer             │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ MCP Server  │  │  CLI Tool    │ │
│  │ (AI agents) │  │ (Developers) │ │
│  └─────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│      Component Layer                │
│  ┌───────────────────────────────┐  │
│  │  ui-interfaces (33 components)│  │
│  │  ui-collections (2 components)│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│      Logic Layer                    │
│  ┌────────┐ ┌──────────┐ ┌───────┐ │
│  │ hooks  │ │ services │ │ types │ │
│  └────────┘ └──────────┘ └───────┘ │
└─────────────────────────────────────┘
```

[See detailed architecture →](ARCHITECTURE.md)

## 📖 External Resources

### Related Projects
- [microbuild-copilot](https://github.com/your-org/microbuild-copilot) - RAD platform boilerplate with agents, prompts, and templates
- [nextjs-supabase-daas](https://github.com/your-org/nextjs-supabase-daas) - DaaS backend server

### Related Documentation
- [Directus Documentation](https://docs.directus.io) - Backend API reference
- [Mantine Documentation](https://mantine.dev) - UI component library
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification
- [pnpm Workspaces](https://pnpm.io/workspaces) - Workspace documentation

### Inspiration
- [shadcn/ui](https://ui.shadcn.com) - CLI-based component distribution
- [Directus](https://directus.io) - Headless CMS
- [VS Code Copilot](https://code.visualstudio.com/docs/copilot/overview) - AI assistant

## 🤝 Contributing

### Development Setup
1. Clone repository
2. Run `pnpm install`
3. Build packages: `pnpm build:packages`
4. Make changes
5. Test: `pnpm cli list` or test MCP

### Adding New Components
1. Create component in `packages/ui-interfaces/src/`
2. Add to registry: `packages/registry.json`
3. Export from `packages/ui-interfaces/src/index.ts`
4. Rebuild: `pnpm build:mcp && pnpm build:cli`
5. Test with CLI and MCP

### Documentation
- Update relevant README files
- Add examples
- Update this index if needed

## 📞 Support

### Getting Help
1. Check [QUICKSTART.md](../QUICKSTART.md) for common setup issues
2. Review [Troubleshooting](../QUICKSTART.md#-troubleshooting)
3. Check package-specific README files
4. Review [DISTRIBUTION.md](DISTRIBUTION.md) for detailed guides

### Reporting Issues
- Document steps to reproduce
- Include error messages
- Specify environment (OS, Node version, etc.)
- Check existing documentation first

## 📝 Changelog

### Version 1.0.0 (January 2026)
- ✨ Initial release
- ✅ MCP server for AI agents
- ✅ CLI tool for developers
- ✅ Component registry (35+ components)
- ✅ Complete documentation
- ✅ Multiple distribution methods
- ✅ Integration with microbuild-copilot RAD platform
- ✅ WorkflowButton with revision comparison
- ✅ Jest testing setup for ui-interfaces

---

**Quick Links:**
- [Get Started](../QUICKSTART.md) | [Packages](../packages/README.md) | [Architecture](ARCHITECTURE.md)
- [MCP Server](../packages/mcp-server/README.md) | [CLI Tool](../packages/cli/README.md) | [Distribution](DISTRIBUTION.md)
