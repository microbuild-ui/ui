# Microbuild UI Packages Distribution Architecture

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
│  │ - Generate examples      │      │ - microbuild bootstrap   │    │
│  │ - Code generation        │      │ - microbuild list        │    │
│  │ - RBAC patterns          │      │ - Copy source files      │    │
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
│  │   (Base)    │  │(CRUD+DaaS)  │  │(Auth+Rels)  │                │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
│         │                │                 │                        │
│         │          DaaSProvider       useAuth                       │
│         │          apiRequest         usePermissions                │
│         └────────────────┼─────────────────┘                        │
│                          │                                          │
│                          ▼                                          │
│         ┌────────────────────────────────────┐                     │
│         │    ui-interfaces/                  │                     │
│         │    (40+ Components)                │                     │
│         │  - Input, Select, DateTime, etc.   │                     │
│         │  - Rich Text (Block, HTML, MD)     │                     │
│         │  - Relational (M2O, O2M, M2M, M2A) │                     │
│         └────────────────┬───────────────────┘                     │
│                          │                                          │
│                          ▼                                          │
│         ┌────────────────────────────────────┐                     │
│         │    ui-form/                        │                     │
│         │  - VForm (with permission filter)  │                     │
│         │  - FormField, FormFieldLabel       │                     │
│         │  - Field processing utilities      │                     │
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
│       ┌─────────────────────────┐   ┌───────────────────────┐      │
│       │   Projects (CLI)        │   │   AI Assistant        │      │
│       ├─────────────────────────┤   ├───────────────────────┤      │
│       │ your-nextjs-app         │   │ Via MCP:              │      │
│       │ your-react-project      │   │ - Discover            │      │
│       │ any-frontend-app        │   │ - Generate            │      │
│       │                         │   │ - Assist              │      │
│       │ Via CLI (Copy & Own):   │   │                       │      │
│       │ - Copy source files     │   │ Via VS Code Copilot:  │      │
│       │ - Transform imports     │   │ - Read components     │      │
│       │ - Full customization    │   │ - Generate code       │      │
│       └─────────────────────────┘   └───────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Testing Layer                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│       ┌─────────────────────────────────────────────────────┐      │
│       │   Playwright E2E Tests (Two-Tier Strategy)          │      │
│       ├─────────────────────────────────────────────────────┤      │
│       │ tests/                                              │      │
│       │   ├── auth.setup.ts    (Authentication setup)       │      │
│       │   └── ui-form/                                      │      │
│       │       ├── vform-storybook.spec.ts (Storybook tests) │      │
│       │       ├── vform-daas.spec.ts (DaaS integration)     │      │
│       │       └── vform.spec.ts (Full E2E workflow)         │      │
│       │                                                     │      │
│       │ Tier 1: Storybook (isolated, no auth, with proxy)   │      │
│       │ Tier 2: DaaS E2E (real API, auth, permissions)      │      │
│       └─────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Distribution Flow

### Flow 1: AI-Assisted Development (MCP)

```
┌──────────────┐
│  VS Code     │
│  Copilot     │
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
│   Copilot generates  │
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

### Flow 3: Project Integration (Copy & Own)

```
┌──────────────────┐
│   Developer      │
│   $ npx          │
│   @microbuild/cli│
│   add input      │
└──────┬───────────┘
       │
       │ CLI copies files
       ▼
┌──────────────────────┐
│   your-project/      │
│   src/components/ui/ │
│   └── input.tsx      │
└──────┬───────────────┘
       │
       │ Local imports
       │ @/components/ui/input
       ▼
┌──────────────────────┐
│   Your Application   │
│   import { Input }   │
│   from '@/components │
│   /ui/input'         │
└──────────────────────┘
```

## Component Registry Structure

```
registry.ts
├── PACKAGES[]
│   ├── @microbuild/types
│   │   └── exports: [Field, Collection, ...]
│   ├── @microbuild/services
│   │   └── exports: [ItemsService, DaaSProvider, ...]
│   ├── @microbuild/hooks
│   │   └── exports: [useAuth, usePermissions, useRelationM2M, ...]
│   ├── @microbuild/ui-interfaces
│   │   └── components: [
│   │       { name: 'Input', category: 'input', ... },
│   │       { name: 'SelectDropdown', category: 'selection', ... },
│   │       ...30 components
│   │   ]
│   ├── @microbuild/ui-form
│   │   └── components: [
│   │       { name: 'VForm', ... },
│   │       { name: 'FormField', ... },
│   │       { name: 'FormFieldLabel', ... }
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
1. User Prompt to Copilot
   "Generate a form with Input and SelectDropdown"

2. Copilot MCP Request
   ├── Tool: list_components
   └── Response: [{ name: 'Input', ... }, { name: 'SelectDropdown', ... }]

3. Copilot MCP Request
   ├── Tool: get_usage_example
   ├── Args: { component: 'Input' }
   └── Response: <example code>

4. Copilot Generates
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

### Scenario 1: Project Setup (Copy & Own)

```
┌──────────────────────────────────┐
│  Microbuild (packages/)          │
│  ├── registry.json               │
│  ├── cli/                        │
│  ├── types/                      │
│  ├── services/                   │
│  ├── hooks/                      │
│  └── ui-interfaces/              │
└────────────────┬─────────────────┘
                 │
                 │ $ npx @microbuild/cli add
                 │ Copies source files
                 ▼
         ┌───────────────┐
         │  Your Project │
         │  (Next.js,    │
         │   React, etc.)│
         │  Own the code │
         └───────────────┘
```

### Scenario 2: New Project Bootstrap

```
┌──────────────────────────────────┐
│  New Next.js Project             │
│  $ npx create-next-app@latest    │
└────────────────┬─────────────────┘
                 │
                 │ Initialize Microbuild
                 │ $ npx @microbuild/cli init
                 ▼
         ┌───────────────┐
         │  Add components│
         │  $ npx         │
         │  @microbuild/  │
         │  cli add input │
         └───────┬───────┘
                 │
                 │ Copies to src/
                 ▼
         ┌───────────────┐
         │  Ready to use │
         │  Full control │
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
         │ VS Code      │
         │ Copilot      │
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

## Authentication Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DaaS Authentication Flow                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Authentication Methods (DaaS-Compatible):                            │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 1. Cookie-Based Sessions - For browser requests (automatic)   │    │
│  │ 2. Static Tokens - For programmatic access (Directus-style)   │    │
│  │ 3. JWT Bearer Tokens - For API clients with Supabase Auth     │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  Client-Side Hooks:                                                    │
│  ┌────────────────────┐   ┌────────────────────┐                     │
│  │ useAuth            │   │ usePermissions     │                     │
│  │ - user             │   │ - canPerform       │                     │
│  │ - isAdmin          │   │ - getAccessibleFld │                     │
│  │ - isAuthenticated  │   │ - isFieldAccessble │                     │
│  │ - checkPermission  │   │ - filterFields     │                     │
│  └─────────┬──────────┘   └─────────┬──────────┘                     │
│            │                        │                                  │
│            └──────────┬─────────────┘                                  │
│                       ▼                                                │
│           ┌─────────────────────┐                                     │
│           │ DaaSProvider        │                                     │
│           │ - config (url/token)│                                     │
│           │ - user              │                                     │
│           │ - isDirectMode      │                                     │
│           │ - buildUrl          │                                     │
│           │ - getHeaders        │                                     │
│           └─────────┬───────────┘                                     │
│                     │                                                  │
│                     ▼                                                  │
│           ┌─────────────────────┐                                     │
│           │ API Endpoints       │                                     │
│           │ /api/users/me       │                                     │
│           │ /api/permissions/me │                                     │
│           │ /api/auth/login     │                                     │
│           │ /api/auth/logout    │                                     │
│           │ /api/auth/user      │                                     │
│           │ /api/auth/callback  │                                     │
│           └─────────────────────┘                                     │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Permission Enforcement Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    VForm Permission Filtering                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐                                                  │
│  │ VForm Component │                                                  │
│  │ enforcePerms=T  │                                                  │
│  │ action="update" │                                                  │
│  └────────┬────────┘                                                  │
│           │                                                            │
│           │ 1. Fetch permissions                                       │
│           ▼                                                            │
│  ┌─────────────────────────────────┐                                  │
│  │ GET /api/permissions/{coll}    │                                  │
│  │   ?action=update               │                                  │
│  └────────┬────────────────────────┘                                  │
│           │                                                            │
│           │ 2. Response: { fields: ['title', 'content'] }             │
│           ▼                                                            │
│  ┌─────────────────────────────────┐                                  │
│  │ Filter fields array            │                                  │
│  │ - All fields: [id, title,      │                                  │
│  │   content, status, author]     │                                  │
│  │ - Accessible: [title, content] │                                  │
│  │ - Filtered: 2 fields shown     │                                  │
│  └────────┬────────────────────────┘                                  │
│           │                                                            │
│           │ 3. Render only accessible fields                          │
│           ▼                                                            │
│  ┌─────────────────────────────────┐                                  │
│  │ FormField: title               │                                  │
│  │ FormField: content             │                                  │
│  │ (id, status, author hidden)    │                                  │
│  └─────────────────────────────────┘                                  │
│                                                                        │
│  Note: Admin users (admin_access=true) bypass filtering               │
│        and see all fields regardless of permissions.                  │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- `┌─┐` Boxes represent systems/components
- `│ ▼` Arrows show data/control flow
- `├──┤` Represents dependencies/relationships

## Auth Proxy Routes Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                   Auth Proxy Routes (installed by CLI)                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Browser (same-origin)                                                │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │  Login Page (/app/login/page.tsx)                          │      │
│  │  → POST /api/auth/login (same-origin, no CORS)            │      │
│  └────────────────────┬───────────────────────────────────────┘      │
│                       │                                               │
│                       ▼                                               │
│  Next.js API Routes (Server-Side)                                    │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │ /api/auth/login    → Supabase signInWithPassword          │      │
│  │ /api/auth/logout   → Supabase signOut + clear cookies     │      │
│  │ /api/auth/user     → DaaS /api/users/me (or fallback)    │      │
│  │ /api/auth/callback → OAuth code exchange + redirect       │      │
│  └────────────────────┬───────────────────────────────────────┘      │
│                       │                                               │
│                       ▼                                               │
│  Supabase Auth (Server-Side, no CORS issues)                         │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │ @supabase/ssr createClient() → server-side cookies        │      │
│  │ Session management with Next.js middleware                 │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                        │
│  Pattern: Browser → Next.js API Route → Supabase Auth (server-side)  │
│  Benefit: No CORS, cookie-based sessions, server-side token mgmt    │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Bootstrap Flow (CLI)

```
┌──────────────────────────────────────────────────────────────────────┐
│                  Bootstrap Command Flow                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  $ microbuild bootstrap --cwd /path/to/project                       │
│                                                                        │
│  Step 1: Init                                                         │
│  ┌─────────────────────────────────────────┐                         │
│  │ • microbuild.json                       │                         │
│  │ • package.json + tsconfig               │                         │
│  │ • Next.js skeleton (layout, page)       │                         │
│  └─────────────────────┬───────────────────┘                         │
│                        ▼                                              │
│  Step 2: Add All Components (non-interactive)                        │
│  ┌─────────────────────────────────────────┐                         │
│  │ • 40+ UI components → components/ui/    │                         │
│  │ • types, services, hooks → lib/microbuild/│                       │
│  │ • API proxy routes → app/api/            │                         │
│  │ • Auth routes → app/api/auth/            │                         │
│  │ • Login page → app/login/page.tsx        │                         │
│  │ • Supabase utilities → lib/supabase/     │                         │
│  │ • Middleware → middleware.ts              │                         │
│  └─────────────────────┬───────────────────┘                         │
│                        ▼                                              │
│  Step 3: Install Dependencies                                        │
│  ┌─────────────────────────────────────────┐                         │
│  │ • pnpm install (auto-detects pkg mgr)   │                         │
│  │ • Mantine, TipTap, Supabase, etc.       │                         │
│  └─────────────────────┬───────────────────┘                         │
│                        ▼                                              │
│  Step 4: Validate                                                     │
│  ┌─────────────────────────────────────────┐                         │
│  │ • Check untransformed imports           │                         │
│  │ • Check missing lib/CSS files           │                         │
│  │ • Check SSR issues                      │                         │
│  │ • Separate TS errors (non-fatal)        │                         │
│  └─────────────────────────────────────────┘                         │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## MCP RBAC Pattern Tool

```
┌──────────────────────────────────────────────────────────────────────┐
│              get_rbac_pattern MCP Tool                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Available Patterns:                                                  │
│  ┌─────────────────────────────────────────┐                         │
│  │ own_items       → Users manage own data │                         │
│  │ role_hierarchy  → Admin>Editor>Viewer   │                         │
│  │ public_read     → Public read + auth write │                      │
│  │ multi_tenant    → Org-level isolation   │                         │
│  │ full_crud       → Unrestricted CRUD     │                         │
│  │ read_only       → Read-only access      │                         │
│  └─────────────────────────────────────────┘                         │
│                                                                        │
│  Returns: Step-by-step MCP tool call sequences                       │
│  ┌─────────────────────────────────────────┐                         │
│  │ 1. Create role(s)                       │                         │
│  │ 2. Create policy/policies               │                         │
│  │ 3. Create access entries                │                         │
│  │ 4. Create permissions per collection    │                         │
│  └─────────────────────────────────────────┘                         │
│                                                                        │
│  Dynamic Variables:                                                   │
│  $CURRENT_USER, $CURRENT_ROLE, $CURRENT_ROLES,                      │
│  $CURRENT_POLICIES, $NOW                                             │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Testing Architecture

### Playwright E2E Test Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Test Execution Flow                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐                                                 │
│  │ $ pnpm test:e2e  │                                                 │
│  └────────┬─────────┘                                                 │
│           │                                                            │
│           │ 1. Run setup project                                       │
│           ▼                                                            │
│  ┌──────────────────┐      ┌──────────────────────────┐              │
│  │ auth.setup.ts    │ ───► │ DaaS App                 │              │
│  │ (Authenticate)   │      │ http://localhost:3000    │              │
│  └────────┬─────────┘      │ /auth/login              │              │
│           │                └──────────────────────────┘              │
│           │ 2. Save auth state                                        │
│           ▼                                                            │
│  ┌──────────────────────────┐                                        │
│  │ playwright/.auth/        │                                        │
│  │   └── admin.json         │                                        │
│  │   (Stored credentials)   │                                        │
│  └────────┬─────────────────┘                                        │
│           │                                                            │
│           │ 3. Run test files with stored auth                        │
│           ▼                                                            │
│  ┌──────────────────────────┐      ┌──────────────────────────┐     │
│  │ tests/ui-form/           │      │ DaaS App                 │     │
│  │   └── vform.spec.ts      │ ───► │ /users, /users/new       │     │
│  │   (19 tests)             │      │ /users/{id}              │     │
│  └────────┬─────────────────┘      └──────────────────────────┘     │
│           │                                                            │
│           │ 4. Generate reports                                        │
│           ▼                                                            │
│  ┌──────────────────────────┐                                        │
│  │ playwright-report/       │                                        │
│  │ test-results/            │                                        │
│  │   (Screenshots, traces)  │                                        │
│  └──────────────────────────┘                                        │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Test Data Management

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Test Data Lifecycle                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  test.beforeEach                                                       │
│  ┌─────────────────────────┐                                         │
│  │ createTestUser(page)    │                                         │
│  │ ├── Navigate to /users  │                                         │
│  │ ├── page.evaluate()     │ ──► POST /api/users                     │
│  │ └── Return user ID      │     (Creates in Supabase)               │
│  └─────────────────────────┘                                         │
│                                                                        │
│  test                                                                  │
│  ┌─────────────────────────┐                                         │
│  │ Use testUserId          │                                         │
│  │ Navigate to /users/{id} │                                         │
│  │ Interact with form      │                                         │
│  │ Assert behaviors        │                                         │
│  └─────────────────────────┘                                         │
│                                                                        │
│  test.afterEach                                                        │
│  ┌─────────────────────────┐                                         │
│  │ deleteTestUser(page)    │                                         │
│  │ └── page.evaluate()     │ ──► DELETE /api/users/{id}              │
│  │     (Cleanup)           │     (Removes from Supabase)             │
│  └─────────────────────────┘                                         │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### VForm Component Integration

```
┌──────────────────────────────────────────────────────────────────────┐
│              VForm Integration with DaaS                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────┐                                             │
│  │ @microbuild/ui-form │                                             │
│  │ ┌─────────────────┐ │                                             │
│  │ │ VForm.tsx       │ │                                             │
│  │ │ FormField.tsx   │ │                                             │
│  │ │ utilities/      │ │                                             │
│  │ └─────────────────┘ │                                             │
│  └──────────┬──────────┘                                             │
│             │                                                          │
│             │ Pattern reused by                                        │
│             ▼                                                          │
│  ┌─────────────────────────────────────┐                             │
│  │ nextjs-supabase-daas               │                             │
│  │ ┌─────────────────────────────────┐│                             │
│  │ │ DynamicForm.tsx                 ││                             │
│  │ │ (data-testid="dynamic-form")    ││                             │
│  │ ├─────────────────────────────────┤│                             │
│  │ │ - Loads fields from /api/fields ││                             │
│  │ │ - Tracks edits (Directus pattern)│                             │
│  │ │ - Shows dirty indicator         ││                             │
│  │ │ - Renders FormField components  ││                             │
│  │ └─────────────────────────────────┘│                             │
│  └─────────────────────────────────────┘                             │
│             │                                                          │
│             │ Tested by                                                │
│             ▼                                                          │
│  ┌─────────────────────────────────────┐                             │
│  │ tests/ui-form/vform.spec.ts        │                             │
│  │ ├── Field Rendering (4 tests)      │                             │
│  │ ├── Field Types (4 tests)          │                             │
│  │ ├── State Management (2 tests)     │                             │
│  │ ├── Create Mode (4 tests)          │                             │
│  │ ├── Validation (2 tests)           │                             │
│  │ └── Layout (2 tests)               │                             │
│  └─────────────────────────────────────┘                             │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```
