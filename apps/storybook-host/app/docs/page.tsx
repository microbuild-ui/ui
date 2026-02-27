export default function DocsPage() {
  return (
    <>
      <div className="docs-breadcrumb">Docs</div>
      <h1 className="docs-title">Introduction</h1>
      <p className="docs-lead">
        Buildpad UI is a set of beautifully-designed, schema-aware components
        and a code distribution platform. Works with Next.js, Mantine v8, and AI
        models. Open Source. Open Code.
      </p>

      <div className="docs-callout">
        <strong>This is not a component library.</strong> It is how you build
        your component library — with real data, real schemas, and real
        permissions.
      </div>

      <p className="docs-paragraph">
        You know how most traditional component libraries work: you install a
        package from npm, import the components, and use them in your app.
      </p>
      <p className="docs-paragraph">
        This approach works well until you need to customize a component to fit
        your internal systems or require one that isn't included in the library.
        Often, you end up wrapping library components, writing workarounds to
        override styles, or mixing components from different libraries with
        incompatible APIs.
      </p>
      <p className="docs-paragraph">
        This is what Buildpad UI aims to solve. It is built around the
        following principles:
      </p>
      <ul className="docs-list">
        <li>
          <strong>Open Code</strong>: The top layer of your component code is
          open for modification.
        </li>
        <li>
          <strong>Schema-Driven</strong>: Components render dynamically from
          DaaS collection metadata — 40+ field interfaces auto-mapped.
        </li>
        <li>
          <strong>Distribution</strong>: A flat-file schema and command-line tool
          make it easy to distribute components.
        </li>
        <li>
          <strong>Permission-Aware</strong>: Field-level permissions enforced
          out of the box via DaaS RBAC.
        </li>
        <li>
          <strong>AI-Ready</strong>: Open code for LLMs to read, understand, and
          improve via MCP Server.
        </li>
      </ul>

      <h2 className="docs-heading" id="open-code">
        Open Code
      </h2>
      <p className="docs-paragraph">
        Buildpad UI hands you the actual component code. You have full control
        to customize and extend the components to your needs. This means:
      </p>
      <ul className="docs-list">
        <li>
          <strong>Full Transparency</strong>: You see exactly how each component
          is built.
        </li>
        <li>
          <strong>Easy Customization</strong>: Modify any part of a component to
          fit your design and functionality requirements.
        </li>
        <li>
          <strong>AI Integration</strong>: Access to the code makes it
          straightforward for LLMs to read, understand, and even improve your
          components.
        </li>
      </ul>
      <p className="docs-paragraph">
        In a typical library, if you need to change a form field&apos;s behavior,
        you have to override styles or wrap the component. With Buildpad UI,
        you simply edit the component code directly.
      </p>

      <h2 className="docs-heading" id="schema-driven">
        Schema-Driven
      </h2>
      <p className="docs-paragraph">
        Every component in Buildpad UI is designed to work with DaaS
        (Data-as-a-Service) collection schemas. VForm reads field metadata and
        automatically renders the correct interface — text inputs, selects,
        date pickers, relational selectors, file uploaders, and more.
      </p>
      <p className="docs-paragraph">
        The field-interface-mapper utility maps 40+ field types to the
        appropriate UI component. When you add <code>collection-form</code> via
        CLI, VForm and all 32 dependent interface components are automatically
        included.
      </p>

      <h2 className="docs-heading" id="distribution">
        Distribution
      </h2>
      <p className="docs-paragraph">
        Buildpad UI is also a code distribution system. It defines a schema
        for components and a CLI to distribute them.
      </p>
      <ul className="docs-list">
        <li>
          <strong>Schema</strong>: A flat-file structure (
          <code>registry.json</code>) that defines the components, their
          dependencies, and properties.
        </li>
        <li>
          <strong>CLI</strong>: A command-line tool to distribute and install
          components across projects with cross-framework support.
        </li>
      </ul>
      <p className="docs-paragraph">
        You can use the schema to distribute your components to other projects
        or have AI generate completely new components based on existing schema.
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`npx @buildpad/cli@latest init
npx @buildpad/cli@latest add collection-form
npx @buildpad/cli@latest bootstrap`}</pre>
      </div>

      <h2 className="docs-heading" id="permission-aware">
        Permission-Aware
      </h2>
      <p className="docs-paragraph">
        Buildpad UI integrates deeply with DaaS RBAC. VForm automatically
        filters fields based on user permissions for create, update, and read
        actions. The <code>usePermissions</code> hook provides field-level and
        action-level permission checking.
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">Usage</div>
        <pre className="docs-pre">{`import { VForm } from '@/components/ui/vform/VForm';

// VForm with permission enforcement
<VForm
  collection="articles"
  fields={fields}
  values={values}
  onChange={handleChange}
  enforcePermissions={true}
  permissionAction="update"
/>`}</pre>
      </div>

      <h2 className="docs-heading" id="ai-ready">
        AI-Ready
      </h2>
      <p className="docs-paragraph">
        The design of Buildpad UI makes it easy for AI tools to work with your
        code. Its open code and consistent API allow AI models to read,
        understand, and even generate new components.
      </p>
      <p className="docs-paragraph">
        The <a href="/docs/mcp">MCP Server</a> enables AI assistants like VS
        Code Copilot, Cursor, and Claude Code to discover components, read
        source code, generate forms, and install components — all through
        natural language.
      </p>
      <p className="docs-paragraph">
        An AI model can learn how your components work and suggest improvements
        or even create new components that integrate with your existing design.
      </p>

      <h2 className="docs-heading" id="component-library">
        Component Library
      </h2>
      <p className="docs-paragraph">
        Buildpad UI provides a comprehensive set of components organized by
        category:
      </p>

      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Components</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Input</td>
              <td>Input, Textarea, InputCode, Tags, Slider</td>
              <td>Text entry and numeric inputs</td>
            </tr>
            <tr>
              <td>Selection</td>
              <td>
                SelectDropdown, SelectRadio, SelectMultipleCheckbox, SelectIcon,
                Color
              </td>
              <td>Single and multi-select interfaces</td>
            </tr>
            <tr>
              <td>Boolean</td>
              <td>Boolean, Toggle</td>
              <td>Switch toggles with state labels</td>
            </tr>
            <tr>
              <td>Date/Time</td>
              <td>DateTime</td>
              <td>Date and time picker</td>
            </tr>
            <tr>
              <td>Media</td>
              <td>File, FileImage, Files, Upload</td>
              <td>File upload with DaaS Files API</td>
            </tr>
            <tr>
              <td>Relational</td>
              <td>ListM2M, ListM2O, ListO2M, ListM2A</td>
              <td>Many-to-Many, Many-to-One, One-to-Many, Many-to-Any</td>
            </tr>
            <tr>
              <td>Rich Text</td>
              <td>RichTextHtml, RichTextMarkdown, InputBlockEditor</td>
              <td>WYSIWYG, Markdown, and block editors</td>
            </tr>
            <tr>
              <td>Layout</td>
              <td>Divider, Notice, GroupDetail</td>
              <td>Form sections and visual separators</td>
            </tr>
            <tr>
              <td>Map</td>
              <td>Map, MapWithRealMap</td>
              <td>Interactive maps with drawing tools</td>
            </tr>
            <tr>
              <td>Workflow</td>
              <td>WorkflowButton</td>
              <td>State transitions with policy commands</td>
            </tr>
            <tr>
              <td>Collection</td>
              <td>VForm, VTable, CollectionForm, CollectionList</td>
              <td>High-level CRUD components</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="docs-footer-nav">
        <div />
        <a href="/docs/installation" className="docs-footer-link">
          Installation →
        </a>
      </div>
    </>
  );
}
