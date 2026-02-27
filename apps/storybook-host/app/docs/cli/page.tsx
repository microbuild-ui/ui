export default function CliPage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / CLI
      </div>
      <h1 className="docs-title">CLI</h1>
      <p className="docs-lead">
        The Buildpad CLI copies component source code directly into your
        project with imports transformed to local paths.
      </p>

      <h2 className="docs-heading" id="installation">
        Installation
      </h2>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`# Use via npx (recommended)
npx @buildpad/cli@latest --help

# Or install globally
npm install -g @buildpad/cli`}</pre>
      </div>

      <h2 className="docs-heading" id="commands">
        Commands
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Command</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>buildpad init</code></td>
              <td>Initialize Buildpad in your project</td>
            </tr>
            <tr>
              <td><code>buildpad bootstrap</code></td>
              <td>Full setup: init + add all + deps + validate</td>
            </tr>
            <tr>
              <td><code>buildpad add &lt;component&gt;</code></td>
              <td>Add component(s) to your project</td>
            </tr>
            <tr>
              <td><code>buildpad list</code></td>
              <td>List all available components</td>
            </tr>
            <tr>
              <td><code>buildpad info &lt;component&gt;</code></td>
              <td>Get detailed info about a component</td>
            </tr>
            <tr>
              <td><code>buildpad tree &lt;component&gt;</code></td>
              <td>Show dependency tree</td>
            </tr>
            <tr>
              <td><code>buildpad diff &lt;component&gt;</code></td>
              <td>Preview changes before adding</td>
            </tr>
            <tr>
              <td><code>buildpad status</code></td>
              <td>Show installed components</td>
            </tr>
            <tr>
              <td><code>buildpad validate</code></td>
              <td>Validate installation for common issues</td>
            </tr>
            <tr>
              <td><code>buildpad fix</code></td>
              <td>Auto-fix common issues</td>
            </tr>
            <tr>
              <td><code>buildpad outdated</code></td>
              <td>Check for component updates</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="add-components">
        Adding Components
      </h2>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`# Add single component
buildpad add input

# Add multiple components
buildpad add input select-dropdown datetime

# Add collection-form (includes VForm + all 32 interface components)
buildpad add collection-form

# Add all components from a category
buildpad add --category selection

# Add all components (non-interactive)
buildpad add --all

# Interactive selection
buildpad add`}</pre>
      </div>

      <h2 className="docs-heading" id="import-transformation">
        Import Transformation
      </h2>
      <p className="docs-paragraph">
        When components are copied to your project, all internal imports are
        automatically transformed:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">Before (source)</div>
        <pre className="docs-pre">{`import { useRelationM2M } from '@buildpad/hooks';
import type { M2MItem } from '@buildpad/types';`}</pre>
      </div>
      <div className="docs-code-block">
        <div className="docs-code-title">After (in your project)</div>
        <pre className="docs-pre">{`import { useRelationM2M } from '@/lib/buildpad/hooks';
import type { M2MItem } from '@/lib/buildpad/types';`}</pre>
      </div>

      <h2 className="docs-heading" id="validation">
        Validation
      </h2>
      <p className="docs-paragraph">
        The <code>validate</code> command checks for common issues:
      </p>
      <ul className="docs-list">
        <li><strong>Untransformed imports</strong> — <code>@buildpad/*</code> imports that weren&apos;t converted</li>
        <li><strong>Missing lib files</strong> — Required utility modules not installed</li>
        <li><strong>Missing CSS files</strong> — CSS required by rich text/block editors</li>
        <li><strong>SSR issues</strong> — Components exported without SSR-safe wrappers</li>
        <li><strong>Missing API routes</strong> — DaaS integration routes not created</li>
      </ul>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`# Validate your installation
buildpad validate

# Auto-fix found issues
buildpad fix`}</pre>
      </div>

      <div className="docs-footer-nav">
        <a href="/docs/installation" className="docs-footer-link">
          ← Installation
        </a>
        <a href="/docs/mcp" className="docs-footer-link">
          MCP Server →
        </a>
      </div>
    </>
  );
}
