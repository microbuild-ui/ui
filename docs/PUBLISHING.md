# Publishing & Release Workflow

This guide covers how to publish `@microbuild/cli` and `@microbuild/mcp` to npm so end-users can run:

```bash
npx @microbuild/cli@latest init
npx @microbuild/cli@latest add button
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      npm registry                                │
│  @microbuild/cli        – binary: npx @microbuild/cli            │
│  @microbuild/mcp        – binary: npx microbuild-mcp             │
└────────────────┬─────────────────────────────────────────────────┘
                 │
   User runs:    │  npx @microbuild/cli add input
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    @microbuild/cli (npm)                          │
│                                                                  │
│  1. Loads registry.json (local if in monorepo, remote otherwise) │
│  2. Fetches source files from GitHub raw CDN                     │
│  3. Transforms imports & copies to user's project                │
└────────────────┬─────────────────────────────────────────────────┘
                 │ fetch()
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│      GitHub raw.githubusercontent.com                            │
│      microbuild-ui/ui/main/packages/…                            │
│                                                                  │
│  registry.json        ← component manifest                      │
│  types/src/core.ts    ← source files                             │
│  hooks/src/useAuth.ts                                            │
│  ui-interfaces/src/…                                             │
└──────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **npm account** — you're already logged in (`npm whoami`)
2. **npm org** — create `@microbuild` org on [npmjs.com](https://www.npmjs.com/org/create) (free for public packages)
3. **GitHub repo** — push this monorepo to GitHub
4. **GitHub secret** — add `NPM_TOKEN` to your repo's Actions secrets

---

## Branch Strategy

```
main  ←── stable, always publishable
  │
  ├── feat/new-component    ← feature branches
  ├── fix/datetime-bug
  └── chore/update-deps
```

| Branch | Purpose | Publishes? |
|--------|---------|------------|
| `main` | Stable release branch | Yes (via Changesets) |
| `feat/*`, `fix/*`, `chore/*` | Development branches | No (PR only) |

### Workflow

1. Create a feature branch from `main`
2. Make changes
3. Run `pnpm changeset` to describe what changed
4. Open a PR to `main`
5. CI runs build + tests
6. Merge PR → Changesets bot opens a "Version Packages" PR
7. Merge the version PR → packages are published to npm automatically

---

## One-Time Setup

### 1. Replace placeholder repository URL

Search for `microbuild-ui/ui` across:
- [packages/mcp-server/package.json](packages/mcp-server/package.json) → `repository.url` (package name: `@microbuild/mcp`)
- [packages/cli/src/resolver.ts](packages/cli/src/resolver.ts) → `DEFAULT_REGISTRY_URL`
- [.github/workflows/publish.yml](.github/workflows/publish.yml)

### 2. Create the npm org

```bash
# Check you're logged in
npm whoami

# The @microbuild scope must exist. If you haven't created it:
# Go to https://www.npmjs.com/org/create → org name: microbuild
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Add NPM_TOKEN to GitHub

1. Generate a token: [npmjs.com → Access Tokens → Generate](https://www.npmjs.com/settings/~/tokens)
   - Type: **Automation** (for CI) or **Granular** with publish permissions
2. Go to your GitHub repo → Settings → Secrets and variables → Actions
3. Add secret: `NPM_TOKEN` = your token

---

## Day-to-Day Release Workflow

### Step 1: Make changes on a feature branch

```bash
git checkout -b feat/new-datetime-picker
# ... make changes ...
```

### Step 2: Add a changeset

```bash
pnpm changeset
```

This prompts you to:
1. Select changed packages (`@microbuild/cli`, `@microbuild/mcp`)
2. Pick bump type: `patch` (bug fix), `minor` (new feature), `major` (breaking)
3. Write a summary

A `.changeset/<random-name>.md` file is created — commit it.

### Step 3: Push and open a PR

```bash
git add .
git commit -m "feat: add new datetime picker"
git push -u origin feat/new-datetime-picker
```

Open a PR to `main`. CI will run automatically.

### Step 4: Merge to main

After review, merge the PR. The Changesets GitHub Action will:
- Detect unreleased changeset files
- Open a **"chore: version packages"** PR that bumps versions in `package.json` and updates CHANGELOGs

### Step 5: Merge the version PR

When you merge this PR:
- Changesets publishes to npm automatically
- Git tags are created (e.g., `@microbuild/cli@0.2.0`)

---

## Manual Publishing (Alternative)

If you prefer not to use CI, publish manually:

```bash
# 1. Ensure you're on main and up to date
git checkout main && git pull

# 2. Add changeset (if not already done)
pnpm changeset

# 3. Apply version bumps
pnpm changeset version

# 4. Commit the version bump
git add .
git commit -m "chore: version packages"

# 5. Build all packages
pnpm build

# 6. Publish to npm
pnpm changeset publish

# 7. Push tags
git push --follow-tags
```

### Quick publish (skip changesets)

For a one-off publish without the changeset flow:

```bash
# Build
pnpm build

# Publish CLI
cd packages/cli
npm publish --access public

# Publish MCP server
cd ../mcp-server
npm publish --access public
```

> **Note:** The packages are already published as `@microbuild/cli@0.1.0` and `@microbuild/mcp@0.1.0` on npmjs.com under the `@microbuild` organization.

---

## What Gets Published

### `@microbuild/cli`

```
dist/
├── index.js          ← CLI entry point (bin: microbuild)
├── index.d.ts
├── templates/        ← scaffold templates (copied at build time)
│   ├── api/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── middleware/
│   ├── supabase/
│   └── types/
└── ...
```

Users run:
```bash
npx @microbuild/cli@latest init        # scaffold project
npx @microbuild/cli@latest add input   # add component
npx @microbuild/cli@latest bootstrap   # full setup
```

### `@microbuild/mcp`

```
dist/
├── index.js          ← MCP server entry (bin: microbuild-mcp)
└── index.d.ts
```

Users configure in VS Code:
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

---

## How the Remote Registry Works

When `@microbuild/cli` is installed via npm (not running from the monorepo), it:

1. **Detects remote mode** — no `registry.json` exists next to the built CLI
2. **Fetches `registry.json`** from GitHub raw URL:
   ```
   https://raw.githubusercontent.com/microbuild-ui/ui/main/packages/registry.json
   ```
3. **Fetches individual source files** (e.g., `types/src/core.ts`) from the same base URL
4. **Transforms imports** and writes files to the user's project

### Overriding the registry URL

```bash
MICROBUILD_REGISTRY_URL=https://your-cdn.com/packages npx @microbuild/cli add input
```

### Local mode (development)

When running from the monorepo checkout (`pnpm cli add input`), the CLI detects `packages/registry.json` on disk and reads files locally — no network requests.

---

## Version Strategy

| Change | Bump | Example |
|--------|------|---------|
| Bug fix | `patch` | 0.1.0 → 0.1.1 |
| New component / feature | `minor` | 0.1.0 → 0.2.0 |
| Breaking CLI change | `major` | 0.2.0 → 1.0.0 |

The CLI and MCP server are **linked** in changeset config — they always publish together at the same version.

---

## Checklist Before First Publish

- [ ] Replace `microbuild-ui/ui` with actual repo path (if different)
- [x] Create `@microbuild` org on npmjs.com
- [ ] Add `NPM_TOKEN` secret to GitHub repo
- [ ] Run `pnpm install` (installs `@changesets/cli`)
- [ ] Run `pnpm build` — verify CLI + MCP server build cleanly
- [ ] Test locally: `node packages/cli/dist/index.js list`
- [ ] Push to `main` and verify CI passes
- [ ] Run `pnpm changeset` → select packages → `patch` → "Initial release"
- [ ] Merge the resulting version PR
- [ ] Verify on npmjs.com: `@microbuild/cli` and `@microbuild/mcp` are published
- [ ] Test: `npx @microbuild/cli@latest init` in a fresh directory
