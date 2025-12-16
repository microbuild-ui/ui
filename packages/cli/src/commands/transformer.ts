/**
 * Import Transformer
 * 
 * Transforms @microbuild/* imports to local path aliases.
 * This is the core of the Copy & Own model - making copied files self-contained.
 */

import type { Config } from './init.js';

/**
 * Import replacement mapping
 */
interface ImportMapping {
  from: RegExp;
  to: string;
}

/**
 * Get import mappings based on config
 */
export function getImportMappings(config: Config): ImportMapping[] {
  const libAlias = config.aliases.lib;
  const componentsAlias = config.aliases.components;

  return [
    // Types
    {
      from: /from ['"]@microbuild\/types['"]/g,
      to: `from '${libAlias}/types'`,
    },
    {
      from: /from ['"]@microbuild\/types\/([^'"]+)['"]/g,
      to: `from '${libAlias}/types/$1'`,
    },
    // Services
    {
      from: /from ['"]@microbuild\/services['"]/g,
      to: `from '${libAlias}/services'`,
    },
    {
      from: /from ['"]@microbuild\/services\/([^'"]+)['"]/g,
      to: `from '${libAlias}/services/$1'`,
    },
    // Hooks
    {
      from: /from ['"]@microbuild\/hooks['"]/g,
      to: `from '${libAlias}/hooks'`,
    },
    {
      from: /from ['"]@microbuild\/hooks\/([^'"]+)['"]/g,
      to: `from '${libAlias}/hooks/$1'`,
    },
    // UI Interfaces (component to component imports)
    {
      from: /from ['"]@microbuild\/ui-interfaces['"]/g,
      to: `from '${componentsAlias}'`,
    },
    {
      from: /from ['"]@microbuild\/ui-interfaces\/([^'"]+)['"]/g,
      to: `from '${componentsAlias}/$1'`,
    },
    // UI Collections (component to component imports)
    {
      from: /from ['"]@microbuild\/ui-collections['"]/g,
      to: `from '${componentsAlias}'`,
    },
    {
      from: /from ['"]@microbuild\/ui-collections\/([^'"]+)['"]/g,
      to: `from '${componentsAlias}/$1'`,
    },
    // Import type statements
    {
      from: /import type \{([^}]+)\} from ['"]@microbuild\/types['"]/g,
      to: `import type {$1} from '${libAlias}/types'`,
    },
    {
      from: /import type \{([^}]+)\} from ['"]@microbuild\/hooks['"]/g,
      to: `import type {$1} from '${libAlias}/hooks'`,
    },
    {
      from: /import type \{([^}]+)\} from ['"]@microbuild\/services['"]/g,
      to: `import type {$1} from '${libAlias}/services'`,
    },
  ];
}

/**
 * Transform a file's content by replacing @microbuild/* imports with local paths
 */
export function transformImports(content: string, config: Config): string {
  const mappings = getImportMappings(config);
  let result = content;

  for (const mapping of mappings) {
    result = result.replace(mapping.from, mapping.to);
  }

  return result;
}

/**
 * Transform internal component imports
 * e.g., import { CollectionList } from '@microbuild/ui-collections' 
 *    -> import { CollectionList } from '@/components/ui/collection-list'
 */
export function transformComponentImports(
  content: string,
  componentName: string,
  config: Config
): string {
  const componentsAlias = config.aliases.components;
  
  // Handle default exports that reference other components
  const componentImportPattern = new RegExp(
    `from ['"]\\.\\.?\\/([^'"]+)['""]`,
    'g'
  );
  
  return content.replace(componentImportPattern, (match, importPath) => {
    // If it's a relative import to another component file, transform it
    if (importPath.startsWith('..')) {
      // Extract component folder name and convert to kebab-case
      const parts = importPath.split('/');
      const componentFolder = parts[parts.length - 1] || parts[parts.length - 2];
      const kebabName = toKebabCase(componentFolder);
      return `from '${componentsAlias}/${kebabName}'`;
    }
    return match;
  });
}

/**
 * Convert PascalCase or camelCase to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert kebab-case to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Check if content has @microbuild/* imports
 */
export function hasMicrobuildImports(content: string): boolean {
  return /@microbuild\/(types|services|hooks|ui-interfaces|ui-collections)/.test(content);
}

/**
 * Extract which @microbuild/* packages are imported
 */
export function extractMicrobuildDependencies(content: string): string[] {
  const deps: Set<string> = new Set();
  
  const patterns = [
    /@microbuild\/types/g,
    /@microbuild\/services/g,
    /@microbuild\/hooks/g,
    /@microbuild\/ui-interfaces/g,
    /@microbuild\/ui-collections/g,
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      const match = pattern.source.match(/@microbuild\/([^/]+)/);
      if (match) {
        // Map package names to lib names
        const libName = match[1].replace('ui-', '');
        if (['types', 'services', 'hooks'].includes(libName)) {
          deps.add(libName);
        }
      }
    }
  }

  return Array.from(deps);
}

/**
 * Add "use client" directive if not present (for Next.js App Router)
 */
export function ensureUseClient(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith('"use client"') || trimmed.startsWith("'use client'")) {
    return content;
  }
  return `"use client";\n\n${content}`;
}

/**
 * Remove "use client" directive if present
 */
export function removeUseClient(content: string): string {
  return content
    .replace(/^["']use client["'];\s*\n*/m, '')
    .trim();
}
