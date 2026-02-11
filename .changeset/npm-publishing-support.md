---
"@microbuild/cli": minor
"@microbuild/mcp": minor
---

Add npm publishing support with remote registry resolver

- CLI now supports fetching components from GitHub raw CDN when installed via npm
- Resolver auto-detects local vs remote mode for seamless dev/published usage
- Renamed @microbuild/mcp-server to @microbuild/mcp
- Added GitHub Actions workflows for CI and automated npm publishing via changesets
