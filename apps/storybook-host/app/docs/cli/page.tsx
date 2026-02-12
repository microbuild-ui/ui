export default function CliPage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / CLI
      </div>
      <h1 className="docs-title">CLI</h1>
      <p className="docs-lead">
        The Microbuild CLI copies component source code directly into your
        project with imports transformed to local paths.
      </p>

      <h2 className="docs-heading" id="installation">
        Installation
      </h2>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`# Use via npx (recommended)
npx @microbuild/cli@latest --help

# Or install globally
npm install -g @microbuild/cli`}</pre>
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
              <td><code>microbuild init</code></td>
              <td>Initialize Microbuild in your project</td>
            </tr>
            <tr>
              <td><code>microbuild bootstrap</code></td>
              <td>Full setup: init + add all + deps + validate</td>
            </tr>
            <tr>
              <td><code>microbuild add &lt;component&gt;</code></td>
              <td>Add component(s) to your project</td>
            </tr>
            <tr>
              <td><code>microbuild list</code></td>
              <td>List all available components</td>
            </tr>
            <tr>
              <td><code>microbuild info &lt;component&gt;</code></td>
              <td>Get detailed info about a component</td>
            </tr>
            <tr>
              <td><code>microbuild tree &lt;component&gt;</code></td>
              <td>Show dependency tree</td>
            </tr>
            <tr>
              <td><code>microbuild diff &lt;component&gt;</code></td>
              <td>Preview changes before adding</td>
            </tr>
            <tr>
              <td><code>microbuild status</code></td>
              <td>Show installed components</td>
            </tr>
            <tr>
              <td><code>microbuild validate</code></td>
              <td>Validate installation for common issues</td>
            </tr>
            <tr>
              <td><code>microbuild fix</code></td>
              <td>Auto-fix common issues</td>
            </tr>
            <tr>
              <td><code>microbuild outdated</code></td>
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
microbuild add input

# Add multiple components
microbuild add input select-dropdown datetime

# Add collection-form (includes VForm + all 32 interface components)
microbuild add collection-form

# Add all components from a category
microbuild add --category selection

# Add all components (non-interactive)
microbuild add --all

# Interactive selection
microbuild add`}</pre>
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
        <pre className="docs-pre">{`import { useRelationM2M } from '@microbuild/hooks';
import type { M2MItem } from '@microbuild/types';`}</pre>
      </div>
      <div className="docs-code-block">
        <div className="docs-code-title">After (in your project)</div>
        <pre className="docs-pre">{`import { useRelationM2M } from '@/lib/microbuild/hooks';
import type { M2MItem } from '@/lib/microbuild/types';`}</pre>
      </div>

      <h2 className="docs-heading" id="validation">
        Validation
      </h2>
      <p className="docs-paragraph">
        The <code>validate</code> command checks for common issues:
      </p>
      <ul className="docs-list">
        <li><strong>Untransformed imports</strong> — <code>@microbuild/*</code> imports that weren&apos;t converted</li>
        <li><strong>Missing lib files</strong> — Required utility modules not installed</li>
        <li><strong>Missing CSS files</strong> — CSS required by rich text/block editors</li>
        <li><strong>SSR issues</strong> — Components exported without SSR-safe wrappers</li>
        <li><strong>Missing API routes</strong> — DaaS integration routes not created</li>
      </ul>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`# Validate your installation
microbuild validate

# Auto-fix found issues
microbuild fix`}</pre>
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
