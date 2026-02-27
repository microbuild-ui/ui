export default function InstallationPage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / Installation
      </div>
      <h1 className="docs-title">Installation</h1>
      <p className="docs-lead">
        How to install and set up Buildpad UI components in your Next.js
        project.
      </p>

      <h2 className="docs-heading" id="prerequisites">
        Prerequisites
      </h2>
      <ul className="docs-list">
        <li>Node.js &gt;= 18.0.0</li>
        <li>pnpm &gt;= 9.0.0</li>
        <li>A Next.js project (13+ with App Router recommended)</li>
      </ul>

      <h2 className="docs-heading" id="bootstrap">
        Bootstrap (Recommended)
      </h2>
      <p className="docs-paragraph">
        The fastest way to set up Buildpad UI is with the{" "}
        <code>bootstrap</code> command. It combines init + add all components +
        install deps + validate into a single non-interactive command.
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`npx @buildpad/cli@latest bootstrap --cwd /path/to/project`}</pre>
      </div>
      <p className="docs-paragraph">This installs:</p>
      <ul className="docs-list">
        <li>
          <code>buildpad.json</code> configuration + Next.js skeleton
        </li>
        <li>40+ UI components in <code>components/ui/</code></li>
        <li>
          Types, services, hooks in <code>lib/buildpad/</code>
        </li>
        <li>API proxy routes (fields, items, relations, files)</li>
        <li>
          Auth proxy routes (login, logout, user, OAuth callback) + login page
        </li>
        <li>Supabase auth utilities and middleware</li>
        <li>
          npm dependencies via <code>pnpm install</code>
        </li>
      </ul>

      <h2 className="docs-heading" id="manual-setup">
        Manual Setup
      </h2>

      <h3 className="docs-subheading">1. Initialize</h3>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`cd your-nextjs-app
npx @buildpad/cli@latest init`}</pre>
      </div>

      <h3 className="docs-subheading">2. Add Components</h3>
      <div className="docs-code-block">
        <div className="docs-code-title">Terminal</div>
        <pre className="docs-pre">{`# Add individual components
npx @buildpad/cli@latest add input select-dropdown datetime

# Add collection-form (includes VForm + all 32 interface components)
npx @buildpad/cli@latest add collection-form

# Add by category
npx @buildpad/cli@latest add --category selection`}</pre>
      </div>

      <h3 className="docs-subheading">3. Use in Your Code</h3>
      <div className="docs-code-block">
        <div className="docs-code-title">page.tsx</div>
        <pre className="docs-pre">{`import { Input } from '@/components/ui/input';
import { SelectDropdown } from '@/components/ui/select-dropdown';

export default function MyPage() {
  return (
    <form>
      <Input label="Name" value={name} onChange={setName} />
      <SelectDropdown
        label="Category"
        choices={[
          { text: 'Blog', value: 'blog' },
          { text: 'News', value: 'news' },
        ]}
        value={category}
        onChange={setCategory}
      />
    </form>
  );
}`}</pre>
      </div>

      <h2 className="docs-heading" id="project-structure">
        Project Structure
      </h2>
      <p className="docs-paragraph">
        After adding components, your project will look like this:
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">Project structure</div>
        <pre className="docs-pre">{`your-project/
├── app/
│   ├── api/
│   │   ├── auth/          # Auth proxy routes
│   │   ├── fields/        # Fields proxy
│   │   └── items/         # Items proxy
│   └── login/page.tsx     # Login page
├── src/
│   ├── components/
│   │   └── ui/            # UI components (copied source)
│   └── lib/
│       └── buildpad/    # Lib modules (auto-resolved)
│           ├── types/
│           ├── services/
│           ├── hooks/
│           └── utils/
└── buildpad.json        # Configuration`}</pre>
      </div>

      <div className="docs-footer-nav">
        <a href="/docs" className="docs-footer-link">
          ← Introduction
        </a>
        <a href="/docs/cli" className="docs-footer-link">
          CLI →
        </a>
      </div>
    </>
  );
}
