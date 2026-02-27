---
"@buildpad/cli": minor
"@buildpad/mcp": minor
---

Add npm publishing support with remote registry resolver

- CLI now supports fetching components from GitHub raw CDN when installed via npm
- Resolver auto-detects local vs remote mode for seamless dev/published usage
- Renamed @buildpad/mcp-server to @buildpad/mcp
- Added GitHub Actions workflows for CI and automated npm publishing via changesets
