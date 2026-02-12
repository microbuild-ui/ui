export default function DesignSystemPage() {
  return (
    <>
      <div className="docs-breadcrumb">
        <a href="/docs">Docs</a> / Design System
      </div>
      <h1 className="docs-title">Design System</h1>
      <p className="docs-lead">
        A token-based design system that mirrors the DaaS backend UI, while
        staying framework-agnostic and brand-neutral.
      </p>

      <h2 className="docs-heading" id="overview">
        Overview
      </h2>
      <p className="docs-paragraph">The design system has three layers:</p>
      <ol className="docs-list docs-list-ordered">
        <li>
          <strong>Design tokens</strong> in{" "}
          <code>app/design-tokens.css</code> (single source of truth)
        </li>
        <li>
          <strong>Mantine theme mapping</strong> in <code>lib/theme.ts</code>{" "}
          (tokens → component defaults)
        </li>
        <li>
          <strong>Global overrides</strong> in <code>app/globals.css</code>{" "}
          (Mantine class-level tweaks)
        </li>
      </ol>

      <h2 className="docs-heading" id="token-strategy">
        Token Strategy
      </h2>
      <p className="docs-paragraph">
        Tokens use the <code>--ds-</code> prefix and CSS custom properties so
        themes can be swapped without rebuilding.
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">design-tokens.css</div>
        <pre className="docs-pre">{`:root {
  --ds-primary: #5925dc;
  --ds-gray-600: #344054;
  --ds-spacing-4: 1rem;
  --ds-radius: 0.375rem;
}`}</pre>
      </div>

      <h2 className="docs-heading" id="mantine-theme">
        Mantine Theme Mapping
      </h2>
      <p className="docs-paragraph">
        <code>lib/theme.ts</code> maps token values into Mantine, so all
        components inherit system defaults automatically.
      </p>
      <div className="docs-code-block">
        <div className="docs-code-title">lib/theme.ts</div>
        <pre className="docs-pre">{`import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "primary",
  fontFamily: "var(--ds-font-family)",
  spacing: {
    sm: "var(--ds-spacing-4)"
  }
});`}</pre>
      </div>

      <h2 className="docs-heading" id="dark-mode">
        Dark Mode
      </h2>
      <p className="docs-paragraph">
        Dark mode is handled with the{" "}
        <code>[data-mantine-color-scheme=&quot;dark&quot;]</code> selector in{" "}
        <code>design-tokens.css</code>. Mantine uses{" "}
        <code>ColorSchemeScript</code> and{" "}
        <code>defaultColorScheme=&quot;auto&quot;</code> in the root layout.
      </p>

      <h2 className="docs-heading" id="customization">
        How to Customize
      </h2>
      <ol className="docs-list docs-list-ordered">
        <li>
          Update token values in <code>app/design-tokens.css</code>
        </li>
        <li>
          Extend <code>lib/theme.ts</code> for component-level defaults
        </li>
        <li>
          Add any global overrides in <code>app/globals.css</code>
        </li>
      </ol>

      <div className="docs-footer-nav">
        <a href="/docs/architecture" className="docs-footer-link">
          ← Architecture
        </a>
        <a href="/docs/distribution" className="docs-footer-link">
          Distribution →
        </a>
      </div>
    </>
  );
}
