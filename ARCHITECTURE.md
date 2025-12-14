# Microbuild Distribution Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Distribution Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────┐      ┌──────────────────────────┐    │
│  │   MCP Server             │      │   CLI Tool               │    │
│  │   (AI Agents)            │      │   (Developers)           │    │
│  ├──────────────────────────┤      ├──────────────────────────┤    │
│  │ - List components        │      │ - microbuild init        │    │
│  │ - Read source code       │      │ - microbuild add         │    │
│  │ - Generate examples      │      │ - microbuild list        │    │
│  │ - Code generation        │      │ - Copy source files      │    │
│  └──────────┬───────────────┘      └──────────┬───────────────┘    │
│             │                                  │                     │
│             └──────────────┬───────────────────┘                     │
│                            │                                         │
│                            ▼                                         │
│                   ┌────────────────┐                                │
│                   │    Registry    │                                │
│                   │   (Metadata)   │                                │
│                   └────────────────┘                                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Source Layer                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   types/    │  │  services/  │  │   hooks/    │                │
│  │   (Base)    │  │   (CRUD)    │  │ (Relations) │                │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
│         │                │                 │                        │
│         └────────────────┼─────────────────┘                        │
│                          │                                          │
│                          ▼                                          │
│         ┌────────────────────────────────────┐                     │
│         │    ui-interfaces/                  │                     │
│         │    (31 Components)                 │                     │
│         │  - Input, Select, DateTime, etc.   │                     │
│         └────────────────┬───────────────────┘                     │
│                          │                                          │
│                          ▼                                          │
│         ┌────────────────────────────────────┐                     │
│         │    ui-collections/                 │                     │
│         │  - CollectionForm                  │                     │
│         │  - CollectionList                  │                     │
│         └────────────────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Consumer Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐        │
│  │   Workspace   │   │  External     │   │  AI Assistant │        │
│  │   Apps        │   │  Projects     │   │  (Claude)     │        │
│  ├───────────────┤   ├───────────────┤   ├───────────────┤        │
│  │ main-nextjs   │   │ Via CLI:      │   │ Via MCP:      │        │
│  │ daas-platform │   │ - Copy files  │   │ - Discover    │        │
│  │               │   │ - Own code    │   │ - Generate    │        │
│  │ Via workspace:│   │ - Customize   │   │ - Assist      │        │
│  │ - Fast HMR    │   │               │   │               │        │
│  │ - Type safe   │   │               │   │               │        │
│  └───────────────┘   └───────────────┘   └───────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Distribution Flow

### Flow 1: AI-Assisted Development (MCP)

```
┌──────────────┐
│   Claude     │
│   Desktop    │
└──────┬───────┘
       │
       │ Request components
       ▼
┌──────────────────────┐
│   MCP Server         │
│   (stdio protocol)   │
└──────┬───────────────┘
       │
       │ Read registry
       │ Load source files
       ▼
┌──────────────────────┐
│   Component          │
│   Registry           │
└──────┬───────────────┘
       │
       │ Return metadata
       │ and source code
       ▼
┌──────────────────────┐
│   Claude generates   │
│   code using         │
│   Microbuild         │
└──────────────────────┘
```

### Flow 2: Developer Workflow (CLI)

```
┌──────────────────┐
│   Developer      │
│   $ microbuild   │
│     add input    │
└──────┬───────────┘
       │
       │ Execute command
       ▼
┌──────────────────────┐
│   CLI Tool           │
│   (commander.js)     │
└──────┬───────────────┘
       │
       │ Check config
       │ Query registry
       ▼
┌──────────────────────┐
│   Component          │
│   Registry           │
└──────┬───────────────┘
       │
       │ Locate source
       │ Copy files
       ▼
┌──────────────────────┐
│   User's Project     │
│   src/components/ui/ │
│   ├── input/         │
│   │   └── index.tsx  │
└──────────────────────┘
```

### Flow 3: Monorepo Development (Workspace)

```
┌──────────────────┐
│   Developer      │
│   $ pnpm dev     │
└──────┬───────────┘
       │
       │ Start dev server
       ▼
┌──────────────────────┐
│   main-nextjs/       │
│   import { Input }   │
│   from '@microbuild/ │
│   ui-interfaces'     │
└──────┬───────────────┘
       │
       │ workspace: protocol
       ▼
┌──────────────────────┐
│   packages/          │
│   ui-interfaces/     │
│   src/input/         │
└──────────────────────┘
       │
       │ Fast HMR
       │ Type checking
       ▼
┌──────────────────────┐
│   Browser            │
│   (rendered app)     │
└──────────────────────┘
```

## Component Registry Structure

```
registry.ts
├── PACKAGES[]
│   ├── @microbuild/types
│   │   └── exports: [Field, Collection, ...]
│   ├── @microbuild/services
│   │   └── exports: [ItemsService, ...]
│   ├── @microbuild/hooks
│   │   └── exports: [useRelationM2M, ...]
│   ├── @microbuild/ui-interfaces
│   │   └── components: [
│   │       { name: 'Input', category: 'input', ... },
│   │       { name: 'SelectDropdown', category: 'selection', ... },
│   │       ...31 components
│   │   ]
│   └── @microbuild/ui-collections
│       └── components: [
│           { name: 'CollectionForm', ... },
│           { name: 'CollectionList', ... }
│       ]
└── Helper functions
    ├── getAllComponents()
    ├── getComponentsByCategory()
    ├── getComponent(name)
    └── getCategories()
```

## Build Process

```
Source Code Changes
       │
       ▼
┌──────────────────┐
│  packages/       │
│  - types/        │
│  - services/     │
│  - hooks/        │
│  - ui-*/         │
└──────┬───────────┘
       │
       │ $ pnpm build:packages
       ▼
┌──────────────────┐
│  Built packages  │
│  (dist/)         │
└──────┬───────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ $ pnpm       │  │ $ pnpm       │
│ build:mcp    │  │ build:cli    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ MCP Server   │  │ CLI Tool     │
│ dist/        │  │ dist/        │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ├─────────────────┘
       │
       ▼
┌──────────────────────┐
│  Ready for           │
│  Distribution        │
└──────────────────────┘
```

## Data Flow Example

### Example: Adding Input Component via CLI

```
1. User Action
   $ microbuild add input

2. CLI Execution
   ├── Load config: microbuild.json
   ├── Query registry: registry.ts
   └── Find component: { name: 'Input', path: '...' }

3. File Operations
   ├── Source: packages/ui-interfaces/src/input/index.tsx
   ├── Target: project/src/components/ui/input/index.tsx
   └── Copy files + check dependencies

4. Dependency Check
   ├── Component needs: @mantine/core, react
   ├── Check package.json
   └── Warn if missing

5. Success
   ├── Component copied
   ├── Ready to import
   └── Developer customizes as needed
```

### Example: AI Code Generation via MCP

```
1. User Prompt to Claude
   "Generate a form with Input and SelectDropdown"

2. Claude MCP Request
   ├── Tool: list_components
   └── Response: [{ name: 'Input', ... }, { name: 'SelectDropdown', ... }]

3. Claude MCP Request
   ├── Tool: get_usage_example
   ├── Args: { component: 'Input' }
   └── Response: <example code>

4. Claude Generates
   import { Input, SelectDropdown } from '@microbuild/ui-interfaces';
   
   function MyForm() {
     const [name, setName] = useState('');
     const [status, setStatus] = useState('');
     
     return (
       <>
         <Input field="name" value={name} onChange={setName} />
         <SelectDropdown field="status" value={status} onChange={setStatus} />
       </>
     );
   }

5. User Reviews & Uses
```

## Deployment Scenarios

### Scenario 1: Internal Team (Current)

```
┌──────────────────────────────────┐
│  Monorepo (Private Git Repo)    │
│  ├── packages/                   │
│  ├── main-nextjs/                │
│  └── daas-platform/              │
└────────────────┬─────────────────┘
                 │
                 │ workspace: protocol
                 │ Fast development
                 ▼
         ┌───────────────┐
         │  Team Members │
         │  pnpm install │
         └───────────────┘
```

### Scenario 2: External Projects

```
┌──────────────────────────────────┐
│  Microbuild Repo (Private)       │
│  └── packages/cli/               │
└────────────────┬─────────────────┘
                 │
                 │ Build & distribute
                 │ npx or global install
                 ▼
         ┌───────────────┐
         │  External Dev │
         │  $ microbuild │
         │    add input  │
         └───────┬───────┘
                 │
                 │ Copies files
                 ▼
         ┌───────────────┐
         │  Their Project│
         │  Own the code │
         └───────────────┘
```

### Scenario 3: AI-Enhanced Development

```
┌──────────────────────────────────┐
│  Microbuild Repo                 │
│  └── packages/mcp-server/        │
└────────────────┬─────────────────┘
                 │
                 │ MCP protocol
                 │ (stdio)
                 ▼
         ┌───────────────┐
         │ Claude Desktop│
         │ AI Assistant  │
         └───────┬───────┘
                 │
                 │ Helps developer
                 │ Generate code
                 ▼
         ┌───────────────┐
         │   Developer   │
         │   Uses AI to  │
         │   build faster│
         └───────────────┘
```

## Security Model

```
┌─────────────────────────────────────┐
│         Private Source Code          │
│         (Not Published)              │
└──────────────┬──────────────────────┘
               │
               ├─── Access Method 1 ───┐
               │                        │
               ▼                        ▼
        ┌──────────┐            ┌──────────┐
        │   MCP    │            │   CLI    │
        │  Server  │            │   Tool   │
        └────┬─────┘            └────┬─────┘
             │                       │
             │ Local only            │ Copies files
             │ No network            │ to user project
             ▼                       ▼
        ┌──────────┐            ┌──────────┐
        │   AI     │            │   User   │
        │ Assistant│            │  Project │
        └──────────┘            └──────────┘
        
        User controls            User owns
        via config               the code
```

---

**Legend:**
- `┌─┐` Boxes represent systems/components
- `│ ▼` Arrows show data/control flow
- `├──┤` Represents dependencies/relationships
