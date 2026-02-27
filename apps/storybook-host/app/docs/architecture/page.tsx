export default function ArchitecturePage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / Architecture
      </div>
      <h1 className="docs-title">Architecture</h1>
      <p className="docs-lead">
        Buildpad UI Packages is organized into three layers: Distribution,
        Source, and Consumer.
      </p>

      <h2 className="docs-heading" id="distribution-layer">
        Distribution Layer
      </h2>
      <p className="docs-paragraph">
        The distribution layer provides two channels for consuming components:
      </p>
      <ul className="docs-list">
        <li>
          <strong>MCP Server</strong> — For AI agents (VS Code Copilot, Cursor,
          Claude Code). Lists components, reads source code, generates examples.
        </li>
        <li>
          <strong>CLI Tool</strong> — For developers. <code>buildpad init</code>,{" "}
          <code>buildpad add</code>, <code>buildpad bootstrap</code>.
        </li>
      </ul>
      <p className="docs-paragraph">
        Both tools read from the same embedded component registry (
        <code>registry.json</code>) containing metadata, dependencies, and file
        mappings.
      </p>

      <h2 className="docs-heading" id="source-layer">
        Source Layer
      </h2>
      <p className="docs-paragraph">
        The source layer contains all the packages in the monorepo:
      </p>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>@buildpad/types</code></td>
              <td>Shared TypeScript type definitions (Field, Collection, Query, etc.)</td>
            </tr>
            <tr>
              <td><code>@buildpad/services</code></td>
              <td>Services (FieldsService, CollectionsService) + DaaS API config</td>
            </tr>
            <tr>
              <td><code>@buildpad/hooks</code></td>
              <td>React hooks for auth, permissions, relations, selection, presets</td>
            </tr>
            <tr>
              <td><code>@buildpad/utils</code></td>
              <td>Field interface mapper, validation, formatting utilities</td>
            </tr>
            <tr>
              <td><code>@buildpad/ui-interfaces</code></td>
              <td>40+ field interface components built with Mantine v8</td>
            </tr>
            <tr>
              <td><code>@buildpad/ui-form</code></td>
              <td>VForm dynamic form component with permission enforcement</td>
            </tr>
            <tr>
              <td><code>@buildpad/ui-table</code></td>
              <td>VTable dynamic data table with sorting, selection, drag-drop</td>
            </tr>
            <tr>
              <td><code>@buildpad/ui-collections</code></td>
              <td>CollectionForm (CRUD wrapper) + CollectionList (paginated table)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="dependency-flow">
        Dependency Flow
      </h2>
      <div className="docs-code-block">
        <div className="docs-code-title">Package dependencies</div>
        <pre className="docs-pre">{`types (base)
  ↓
services (CRUD + DaaS)    hooks (auth + relations)
  ↓                         ↓
  └─────────┬───────────────┘
            ↓
    ui-interfaces (40+ components)
            ↓
       ui-form (VForm)
            ↓
   ui-collections (CollectionForm, CollectionList)`}</pre>
      </div>

      <h2 className="docs-heading" id="consumer-layer">
        Consumer Layer
      </h2>
      <p className="docs-paragraph">
        Projects consume Buildpad components via the CLI (Copy &amp; Own model)
        or through AI agents via MCP. Components are copied as source code with
        imports transformed to local paths.
      </p>

      <h2 className="docs-heading" id="testing-layer">
        Testing Layer
      </h2>
      <p className="docs-paragraph">
        Playwright E2E tests use a two-tier strategy:
      </p>
      <ul className="docs-list">
        <li>
          <strong>Storybook tests</strong> — Isolated component tests with mocked
          data (no auth required)
        </li>
        <li>
          <strong>DaaS E2E tests</strong> — Full integration tests against real
          DaaS backend with authentication
        </li>
      </ul>

      <div className="docs-footer-nav">
        <a href="/docs/mcp" className="docs-footer-link">
          ← MCP Server
        </a>
        <a href="/docs/design-system" className="docs-footer-link">
          Design System →
        </a>
      </div>
    </>
  );
}
