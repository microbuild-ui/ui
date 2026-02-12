export default function ComponentsPage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / Component Map
      </div>
      <h1 className="docs-title">Component Map</h1>
      <p className="docs-lead">
        Quick reference for all available components, their CLI commands, and
        categories.
      </p>

      <h2 className="docs-heading" id="high-level">
        High-Level Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>vform</code></td>
              <td><code>microbuild add vform</code></td>
              <td>Dynamic form — renders 40+ interface types</td>
            </tr>
            <tr>
              <td><code>vtable</code></td>
              <td><code>microbuild add vtable</code></td>
              <td>Dynamic table with sorting, selection, drag-drop</td>
            </tr>
            <tr>
              <td><code>collection-form</code></td>
              <td><code>microbuild add collection-form</code></td>
              <td>CRUD wrapper with data fetching (uses VForm)</td>
            </tr>
            <tr>
              <td><code>collection-list</code></td>
              <td><code>microbuild add collection-list</code></td>
              <td>Dynamic table with pagination</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="input">
        Input Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>input</code></td><td><code>microbuild add input</code></td></tr>
            <tr><td><code>textarea</code></td><td><code>microbuild add textarea</code></td></tr>
            <tr><td><code>input-code</code></td><td><code>microbuild add input-code</code></td></tr>
            <tr><td><code>input-block-editor</code></td><td><code>microbuild add input-block-editor</code></td></tr>
            <tr><td><code>tags</code></td><td><code>microbuild add tags</code></td></tr>
            <tr><td><code>slider</code></td><td><code>microbuild add slider</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="selection">
        Selection Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>select-dropdown</code></td><td><code>microbuild add select-dropdown</code></td></tr>
            <tr><td><code>select-radio</code></td><td><code>microbuild add select-radio</code></td></tr>
            <tr><td><code>select-multiple-checkbox</code></td><td><code>microbuild add select-multiple-checkbox</code></td></tr>
            <tr><td><code>select-multiple-checkbox-tree</code></td><td><code>microbuild add select-multiple-checkbox-tree</code></td></tr>
            <tr><td><code>select-multiple-dropdown</code></td><td><code>microbuild add select-multiple-dropdown</code></td></tr>
            <tr><td><code>select-icon</code></td><td><code>microbuild add select-icon</code></td></tr>
            <tr><td><code>autocomplete-api</code></td><td><code>microbuild add autocomplete-api</code></td></tr>
            <tr><td><code>collection-item-dropdown</code></td><td><code>microbuild add collection-item-dropdown</code></td></tr>
            <tr><td><code>color</code></td><td><code>microbuild add color</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="boolean">
        Boolean Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>boolean</code></td><td><code>microbuild add boolean</code></td></tr>
            <tr><td><code>toggle</code></td><td><code>microbuild add toggle</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="datetime">
        DateTime
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>datetime</code></td><td><code>microbuild add datetime</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="media">
        Media Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>file</code></td><td><code>microbuild add file</code></td></tr>
            <tr><td><code>file-image</code></td><td><code>microbuild add file-image</code></td></tr>
            <tr><td><code>files</code></td><td><code>microbuild add files</code></td></tr>
            <tr><td><code>upload</code></td><td><code>microbuild add upload</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="relational">
        Relational Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>list-m2m</code></td><td><code>microbuild add list-m2m</code></td></tr>
            <tr><td><code>list-m2o</code></td><td><code>microbuild add list-m2o</code></td></tr>
            <tr><td><code>list-o2m</code></td><td><code>microbuild add list-o2m</code></td></tr>
            <tr><td><code>list-m2a</code></td><td><code>microbuild add list-m2a</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="layout">
        Layout Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>divider</code></td><td><code>microbuild add divider</code></td></tr>
            <tr><td><code>notice</code></td><td><code>microbuild add notice</code></td></tr>
            <tr><td><code>group-detail</code></td><td><code>microbuild add group-detail</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="rich-text">
        Rich Text Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>rich-text-html</code></td><td><code>microbuild add rich-text-html</code></td></tr>
            <tr><td><code>rich-text-markdown</code></td><td><code>microbuild add rich-text-markdown</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="map">
        Map Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>map</code></td><td><code>microbuild add map</code></td></tr>
            <tr><td><code>map-with-real-map</code></td><td><code>microbuild add map-with-real-map</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="docs-heading" id="workflow">
        Workflow Components
      </h2>
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>workflow-button</code></td><td><code>microbuild add workflow-button</code></td></tr>
          </tbody>
        </table>
      </div>

      <div className="docs-footer-nav">
        <a href="/docs/distribution" className="docs-footer-link">
          ← Distribution
        </a>
        <a href="/docs/testing" className="docs-footer-link">
          Testing →
        </a>
      </div>
    </>
  );
}
