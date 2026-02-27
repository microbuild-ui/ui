export default function DistributionPage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / Distribution
      </div>
      <h1 className="docs-title">Distribution</h1>
      <p className="docs-lead">
        Buildpad UI uses the Copy &amp; Own distribution model — components
        are copied as source code to your project.
      </p>

      <h2 className="docs-heading" id="copy-and-own">
        Copy &amp; Own
      </h2>
      <p className="docs-paragraph">
        Unlike traditional npm packages, Buildpad components are distributed
        as source code. When you add a component, the CLI:
      </p>
      <ol className="docs-list docs-list-ordered">
        <li>Fetches the source from the registry</li>
        <li>Transforms <code>@buildpad/*</code> imports to local paths</li>
        <li>Resolves and copies dependencies (lib modules, other components)</li>
        <li>Copies files to your project directory</li>
      </ol>

      <h2 className="docs-heading" id="advantages">
        Advantages
      </h2>
      <ul className="docs-list">
        <li>
          <strong>Full customization</strong> — Components become your
          application code
        </li>
        <li>
          <strong>No breaking changes</strong> — No upstream updates can break
          your code
        </li>
        <li>
          <strong>No external dependencies</strong> — No runtime dependency on
          <code>@buildpad/*</code> packages
        </li>
        <li>
          <strong>Works offline</strong> — After installation, no network access
          needed
        </li>
        <li>
          <strong>AI-friendly</strong> — Source code is readable by LLMs for
          understanding and improvement
        </li>
      </ul>

      <h2 className="docs-heading" id="registry">
        Registry Schema
      </h2>
      <p className="docs-paragraph">
        The <code>registry.json</code> file defines each component with:
      </p>
      <ul className="docs-list">
        <li>Name, description, and category</li>
        <li>Source file paths</li>
        <li>
          Three types of dependencies:
          <ul className="docs-list">
            <li>
              <strong>dependencies</strong> — External npm packages (e.g.,{" "}
              <code>@mantine/core</code>, <code>dayjs</code>)
            </li>
            <li>
              <strong>internalDependencies</strong> — Lib modules (types,
              services, hooks, utils)
            </li>
            <li>
              <strong>registryDependencies</strong> — Other Buildpad
              components
            </li>
          </ul>
        </li>
      </ul>

      <h2 className="docs-heading" id="npm-packages">
        npm Packages
      </h2>
      <p className="docs-paragraph">
        The CLI and MCP server are published on npm for easy access:
      </p>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>@buildpad/cli</code></td>
              <td>
                <code>npx @buildpad/cli@latest add input</code>
              </td>
            </tr>
            <tr>
              <td><code>@buildpad/mcp</code></td>
              <td>
                <code>npx @buildpad/mcp@latest</code> (for AI agents)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="docs-footer-nav">
        <a href="/docs/design-system" className="docs-footer-link">
          ← Design System
        </a>
        <a href="/docs/components" className="docs-footer-link">
          Components →
        </a>
      </div>
    </>
  );
}
