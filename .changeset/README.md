# Changesets

This directory is managed by [Changesets](https://github.com/changesets/changesets).

When you make changes that should be released, run:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages changed (`@buildpad/cli`, `@buildpad/mcp`)
2. Choose a semver bump type (patch / minor / major)
3. Write a summary of the change

The changeset file is committed alongside your code and consumed during the release process.
