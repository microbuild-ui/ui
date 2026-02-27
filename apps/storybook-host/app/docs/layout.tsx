"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarNav = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "CLI", href: "/docs/cli" },
      { title: "MCP Server", href: "/docs/mcp" },
    ],
  },
  {
    title: "Architecture",
    items: [
      { title: "Overview", href: "/docs/architecture" },
      { title: "Design System", href: "/docs/design-system" },
      { title: "Distribution", href: "/docs/distribution" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Component Map", href: "/docs/components" },
    ],
  },
  {
    title: "Testing",
    items: [
      { title: "Testing Guide", href: "/docs/testing" },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <div className="docs-sidebar-header">
          <Link href="/" className="docs-logo">
            Buildpad UI
          </Link>
        </div>
        <nav className="docs-nav">
          {sidebarNav.map((section) => (
            <div key={section.title} className="docs-nav-section">
              <h4 className="docs-nav-heading">{section.title}</h4>
              <ul className="docs-nav-list">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`docs-nav-link ${
                        pathname === item.href ? "docs-nav-link-active" : ""
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="docs-main">
        <article className="docs-content">{children}</article>
      </main>
    </div>
  );
}
