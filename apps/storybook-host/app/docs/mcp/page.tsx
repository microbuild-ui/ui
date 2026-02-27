export default function McpPage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / MCP Server
      </div>
      <h1 className="docs-title">MCP Server</h1>
      <p className="docs-lead">
        Use the Buildpad MCP server to browse, search, and install components
        from the registry using natural language.
      </p>
      <p className="docs-paragraph">
        The Buildpad MCP Server allows AI assistants to interact with the
        component registry. You can browse available components, search for
        specific ones, and install them directly into your project using natural
        language.
      </p>
      <p className="docs-paragraph">
        For example, you can ask an AI assistant to{" "}
        <em>&quot;Generate a CollectionForm for a products collection&quot;</em> or{" "}
        <em>
          &quot;Add the input, select-dropdown, and datetime components to my
          project&quot;
        </em>
        .
      </p>

      <h2 className="docs-heading" id="quick-start">
        Quick Start
      </h2>
      <p className="docs-paragraph">
        Select your MCP client and follow the instructions to configure the
        Buildpad MCP server. If you&apos;d like to do it manually, see the{" "}
        <a href="#configuration">Configuration</a> section.
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`# Using npx (recommended — no install required)
npx @microbuild/mcp@latest`}</pre>
      </div>
      <p className="docs-paragraph">
        Restart your MCP client and try the following prompts:
      </p>
      <ul className="docs-list">
        <li>
          <em>&quot;List all available Buildpad components&quot;</em>
        </li>
        <li>
          <em>
            &quot;Add the input, select-dropdown, and datetime components to my
            project&quot;
          </em>
        </li>
        <li>
          <em>
            &quot;Generate a CollectionForm for a products collection&quot;
          </em>
        </li>
      </ul>

      <h2 className="docs-heading" id="what-is-mcp">
        What is MCP?
      </h2>
      <p className="docs-paragraph">
        <a
          href="https://modelcontextprotocol.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Model Context Protocol (MCP)
        </a>{" "}
        is an open protocol that enables AI assistants to securely connect to
        external data sources and tools. With the Buildpad MCP server, your AI
        assistant gains direct access to:
      </p>
      <ul className="docs-list">
        <li>
          <strong>Browse Components</strong> — List all available components,
          their categories, and dependencies from the registry
        </li>
        <li>
          <strong>Read Source Code</strong> — Access full component source code
          and documentation
        </li>
        <li>
          <strong>Install with Natural Language</strong> — Add components using
          simple conversational prompts like &quot;add a collection form&quot;
        </li>
        <li>
          <strong>Generate Code</strong> — Generate forms, interfaces, and usage
          examples
        </li>
        <li>
          <strong>RBAC Patterns</strong> — Get role-based access control setup
          patterns for DaaS applications
        </li>
      </ul>

      <h2 className="docs-heading" id="how-it-works">
        How It Works
      </h2>
      <p className="docs-paragraph">
        The MCP server acts as a bridge between your AI assistant, the component
        registry, and the Buildpad CLI.
      </p>
      <ol className="docs-list docs-list-ordered">
        <li>
          <strong>Registry Connection</strong> — MCP connects to the Buildpad
          component registry (<code>registry.json</code>)
        </li>
        <li>
          <strong>Natural Language</strong> — You describe what you need in plain
          English
        </li>
        <li>
          <strong>AI Processing</strong> — The assistant translates your request
          into registry commands
        </li>
        <li>
          <strong>Component Delivery</strong> — Source code is fetched and
          installed in your project via the CLI
        </li>
      </ol>

      <h2 className="docs-heading" id="available-tools">
        Available Tools
      </h2>
      <p className="docs-paragraph">
        The MCP server exposes the following tools to AI assistants:
      </p>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>list_components</code>
              </td>
              <td>
                List all available components with descriptions and categories
              </td>
            </tr>
            <tr>
              <td>
                <code>get_component</code>
              </td>
              <td>
                Get detailed information and source code for a specific
                component
              </td>
            </tr>
            <tr>
              <td>
                <code>list_packages</code>
              </td>
              <td>List all Buildpad packages with their exports</td>
            </tr>
            <tr>
              <td>
                <code>get_install_command</code>
              </td>
              <td>Get CLI commands to install components by name or category</td>
            </tr>
            <tr>
              <td>
                <code>copy_component</code>
              </td>
              <td>
                Get complete source code and file structure to manually copy a
                component (shadcn-style)
              </td>
            </tr>
            <tr>
              <td>
                <code>generate_form</code>
              </td>
              <td>
                Generate a CollectionForm with specified collection and fields
              </td>
            </tr>
            <tr>
              <td>
                <code>generate_interface</code>
              </td>
              <td>Generate a field interface component with custom props</td>
            </tr>
            <tr>
              <td>
                <code>get_usage_example</code>
              </td>
              <td>
                Get real-world usage examples with local imports
              </td>
            </tr>
            <tr>
              <td>
                <code>get_copy_own_info</code>
              </td>
              <td>
                Get detailed information about the Copy &amp; Own distribution
                model
              </td>
            </tr>
            <tr>
              <td>
                <code>get_rbac_pattern</code>
              </td>
              <td>
                Get RBAC setup patterns (own_items, role_hierarchy, public_read,
                multi_tenant, etc.)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="configuration">
        Configuration
      </h2>
      <p className="docs-paragraph">
        You can use any MCP client to interact with the Buildpad MCP server.
        Here are the instructions for the most popular ones.
      </p>

      <h3 className="docs-subheading" id="vs-code">
        VS Code (GitHub Copilot)
      </h3>
      <p className="docs-paragraph">
        To configure MCP in VS Code with GitHub Copilot, add the Buildpad
        server to your project&apos;s <code>.vscode/mcp.json</code> configuration
        file:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">.vscode/mcp.json</div>
        <pre className="docs-pre">{`{
  "servers": {
    "microbuild": {
      "command": "npx",
      "args": ["@microbuild/mcp@latest"]
    }
  }
}`}</pre>
      </div>
      <p className="docs-paragraph">
        After adding the configuration, open <code>.vscode/mcp.json</code> and
        click <strong>Start</strong> next to the Buildpad server.
      </p>
      <p className="docs-paragraph">
        Or add to your VS Code <code>settings.json</code>:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">settings.json</div>
        <pre className="docs-pre">{`{
  "mcp": {
    "servers": {
      "microbuild": {
        "command": "npx",
        "args": ["@microbuild/mcp@latest"]
      }
    }
  }
}`}</pre>
      </div>
      <p className="docs-paragraph">
        Reload VS Code window (
        <code>Cmd+Shift+P</code> → &quot;Developer: Reload Window&quot;).
      </p>

      <h3 className="docs-subheading" id="cursor">
        Cursor
      </h3>
      <p className="docs-paragraph">
        Add to your project&apos;s <code>.cursor/mcp.json</code>:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">.cursor/mcp.json</div>
        <pre className="docs-pre">{`{
  "mcpServers": {
    "microbuild": {
      "command": "npx",
      "args": ["@microbuild/mcp@latest"]
    }
  }
}`}</pre>
      </div>
      <p className="docs-paragraph">
        After adding the configuration, enable the Buildpad MCP server in
        Cursor Settings. Once enabled, you should see a green dot next to the
        Buildpad server in the MCP server list.
      </p>

      <h3 className="docs-subheading" id="claude-code">
        Claude Code
      </h3>
      <p className="docs-paragraph">
        Add to your project&apos;s <code>.mcp.json</code>:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">.mcp.json</div>
        <pre className="docs-pre">{`{
  "mcpServers": {
    "microbuild": {
      "command": "npx",
      "args": ["@microbuild/mcp@latest"]
    }
  }
}`}</pre>
      </div>
      <p className="docs-paragraph">
        Restart Claude Code and run <code>/mcp</code> to verify the Buildpad
        server is connected.
      </p>

      <h3 className="docs-subheading" id="local-build">
        Local Build (Development)
      </h3>
      <p className="docs-paragraph">
        For development within the monorepo, build the MCP server locally:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`cd /path/to/microbuild-ui-packages
pnpm build:mcp`}</pre>
      </div>
      <p className="docs-paragraph">
        Then configure your MCP client to use the local build:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">settings.json</div>
        <pre className="docs-pre">{`{
  "mcp": {
    "servers": {
      "microbuild": {
        "command": "node",
        "args": [
          "/absolute/path/to/microbuild-ui-packages/packages/mcp-server/dist/index.js"
        ]
      }
    }
  }
}`}</pre>
      </div>

      <h2 className="docs-heading" id="rbac-patterns">
        RBAC Patterns
      </h2>
      <p className="docs-paragraph">
        The <code>get_rbac_pattern</code> tool provides step-by-step setup
        patterns for role-based access control in DaaS applications:
      </p>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>own_items</code>
              </td>
              <td>
                Users manage their own records, read others&apos; published items
              </td>
            </tr>
            <tr>
              <td>
                <code>role_hierarchy</code>
              </td>
              <td>Admin → Editor → Viewer cascading permissions</td>
            </tr>
            <tr>
              <td>
                <code>public_read</code>
              </td>
              <td>Public read + authenticated write</td>
            </tr>
            <tr>
              <td>
                <code>multi_tenant</code>
              </td>
              <td>Organization-level data isolation</td>
            </tr>
            <tr>
              <td>
                <code>full_crud</code>
              </td>
              <td>Unrestricted CRUD access</td>
            </tr>
            <tr>
              <td>
                <code>read_only</code>
              </td>
              <td>Read-only access</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="example-prompts">
        Example Prompts
      </h2>
      <p className="docs-paragraph">
        Once the MCP server is configured, you can use natural language to
        interact with the registry. Try one of the following prompts:
      </p>

      <h3 className="docs-subheading">Browse &amp; Search</h3>
      <ul className="docs-list">
        <li>
          <em>&quot;Show me all available components in Buildpad&quot;</em>
        </li>
        <li>
          <em>&quot;List all selection components&quot;</em>
        </li>
        <li>
          <em>&quot;Show me the source code for VForm&quot;</em>
        </li>
      </ul>

      <h3 className="docs-subheading">Install Components</h3>
      <ul className="docs-list">
        <li>
          <em>
            &quot;Add the input, select-dropdown, and datetime components to my
            project&quot;
          </em>
        </li>
        <li>
          <em>
            &quot;Install all relational components&quot;
          </em>
        </li>
        <li>
          <em>
            &quot;Bootstrap my project with all Buildpad components&quot;
          </em>
        </li>
      </ul>

      <h3 className="docs-subheading">Generate Code</h3>
      <ul className="docs-list">
        <li>
          <em>
            &quot;Generate a CollectionForm for a products collection&quot;
          </em>
        </li>
        <li>
          <em>&quot;Show me how to use the SelectDropdown component&quot;</em>
        </li>
        <li>
          <em>
            &quot;Set up RBAC with own_items pattern for articles&quot;
          </em>
        </li>
        <li>
          <em>
            &quot;Generate role hierarchy for Admin, Editor, Viewer&quot;
          </em>
        </li>
      </ul>

      <h2 className="docs-heading" id="copy-and-own">
        Copy &amp; Own Model
      </h2>
      <p className="docs-paragraph">
        Buildpad uses the <strong>Copy &amp; Own</strong> distribution model
        (similar to shadcn/ui):
      </p>
      <ul className="docs-list">
        <li>Components are copied as source code to your project</li>
        <li>
          Full customization — components become your application code
        </li>
        <li>No external package dependencies for component code</li>
        <li>No breaking changes from upstream updates</li>
        <li>Works offline after installation</li>
      </ul>
      <p className="docs-paragraph">
        When installed via CLI, imports like{" "}
        <code>@microbuild/hooks</code> are automatically transformed to local
        paths like <code>@/lib/microbuild/hooks</code>.
      </p>

      <h2 className="docs-heading" id="troubleshooting">
        Troubleshooting
      </h2>

      <h3 className="docs-subheading">MCP Not Responding</h3>
      <p className="docs-paragraph">
        If the MCP server isn&apos;t responding to prompts:
      </p>
      <ol className="docs-list docs-list-ordered">
        <li>
          <strong>Check Configuration</strong> — Verify the MCP server is
          properly configured and enabled in your MCP client
        </li>
        <li>
          <strong>Restart MCP Client</strong> — Restart your MCP client after
          configuration changes
        </li>
        <li>
          <strong>Verify Installation</strong> — Ensure{" "}
          <code>npx @microbuild/mcp@latest</code> is accessible
        </li>
        <li>
          <strong>Check Network</strong> — Confirm you can access npm for the
          npx command
        </li>
      </ol>

      <h3 className="docs-subheading">No Tools or Prompts</h3>
      <p className="docs-paragraph">
        If you see the &quot;No tools or prompts&quot; message:
      </p>
      <ol className="docs-list docs-list-ordered">
        <li>
          Clear the npx cache: <code>npx clear-npx-cache</code>
        </li>
        <li>Re-enable the MCP server in your MCP client</li>
        <li>
          Check logs — In VS Code, open the Output panel (
          <code>Cmd+Shift+U</code>) and select &quot;MCP&quot; from the dropdown
        </li>
      </ol>

      <h2 className="docs-heading" id="learn-more">
        Learn More
      </h2>
      <ul className="docs-list">
        <li>
          <a href="/docs/cli">CLI Documentation</a> — Complete guide to the
          Buildpad CLI
        </li>
        <li>
          <a href="/docs/distribution">Distribution</a> — How the Copy &amp;
          Own model works
        </li>
        <li>
          <a href="/docs/components">Component Map</a> — Quick reference for all
          components
        </li>
        <li>
          <a
            href="https://modelcontextprotocol.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            MCP Specification
          </a>{" "}
          — Learn about Model Context Protocol
        </li>
        <li>
          <a
            href="https://www.npmjs.com/package/@microbuild/mcp"
            target="_blank"
            rel="noopener noreferrer"
          >
            @microbuild/mcp on npm
          </a>{" "}
          — Published MCP server package
        </li>
      </ul>

      <div className="docs-footer-nav">
        <a href="/docs/cli" className="docs-footer-link">
          ← CLI
        </a>
        <a href="/docs/architecture" className="docs-footer-link">
          Architecture →
        </a>
      </div>
    </>
  );
}
