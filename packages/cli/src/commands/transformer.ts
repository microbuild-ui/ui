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
    // Utils
    {
      from: /from ['"]@microbuild\/utils['"]/g,
      to: `from '${libAlias}/utils'`,
    },
    {
      from: /from ['"]@microbuild\/utils\/([^'"]+)['"]/g,
      to: `from '${libAlias}/utils/$1'`,
    },
    // UI Form (VForm and related components)
    {
      from: /from ['"]@microbuild\/ui-form['"]/g,
      to: `from '${componentsAlias}/vform'`,
    },
    {
      from: /from ['"]@microbuild\/ui-form\/([^'"]+)['"]/g,
      to: `from '${componentsAlias}/vform/$1'`,
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
    // Import type for utils
    {
      from: /import type \{([^}]+)\} from ['"]@microbuild\/utils['"]/g,
      to: `import type {$1} from '${libAlias}/utils'`,
    },
    // Import type for ui-form
    {
      from: /import type \{([^}]+)\} from ['"]@microbuild\/ui-form['"]/g,
      to: `import type {$1} from '${componentsAlias}/vform'`,
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
  return /@microbuild\/(types|services|hooks|utils|ui-interfaces|ui-collections|ui-form)/.test(content);
}

/**
 * Known relative import mappings for ui-interfaces components
 * Maps source folder imports to target file imports when flattening structure
 */
const RELATIVE_IMPORT_MAPPINGS: Record<string, string> = {
  // file-image/FileImage.tsx imports from ../upload → ./upload
  '../upload': './upload',
  // file/File.tsx imports from ../upload → ./upload
  // files/Files.tsx imports from ../upload → ./upload
  // list-o2m imports from ../upload → ./upload
};

/**
 * Known relative import mappings for VForm components (nested folder structure)
 * VForm keeps its folder structure, so imports like '../types' need to stay as '../types'
 * but imports from './types' when in the same folder should remain './types'
 */
const VFORM_IMPORT_MAPPINGS: Record<string, Record<string, string>> = {
  // Files in vform/components/ folder
  'components': {
    '../types': '../types',
    './types': '../types',
  },
  // Files in vform/utils/ folder  
  'utils': {
    '../types': '../types',
    './types': '../types',
  },
  // Files in vform/ root folder
  'root': {
    './types': './types',
  },
};

/**
 * Transform VForm-specific relative imports based on source file location
 */
export function transformVFormImports(
  content: string,
  sourceFile: string,
  targetFile: string
): string {
  let result = content;
  
  // Determine which subfolder this file is in
  let folder = 'root';
  if (sourceFile.includes('/components/')) {
    folder = 'components';
  } else if (sourceFile.includes('/utils/')) {
    folder = 'utils';
  }
  
  const mappings = VFORM_IMPORT_MAPPINGS[folder] || {};
  
  for (const [from, to] of Object.entries(mappings)) {
    const importPattern = new RegExp(
      `(from\\s+['"])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`,
      'g'
    );
    result = result.replace(importPattern, `$1${to}$2`);
  }
  
  return result;
}

/**
 * Transform relative imports when flattening component folder structure
 * e.g., file-image/FileImage.tsx has `from '../upload'` 
 *       which becomes `from './upload'` when copied to components/ui/file-image.tsx
 */
export function transformRelativeImports(
  content: string, 
  sourceFile: string,
  targetFile: string,
  componentsAlias: string
): string {
  let result = content;
  
  // Calculate source and target depths
  const sourceParts = sourceFile.split('/');
  const targetParts = targetFile.split('/');
  
  // Check if source is nested (e.g., file-image/FileImage.tsx) and target is flat (e.g., file-image.tsx)
  const sourceIsNested = sourceParts.length > 2; // e.g., ui-interfaces/src/file-image/FileImage.tsx
  const targetIsFlat = !targetParts[targetParts.length - 1].includes('/'); // e.g., components/ui/file-image.tsx
  
  // Apply known mappings
  for (const [from, to] of Object.entries(RELATIVE_IMPORT_MAPPINGS)) {
    // Match import statements with this relative path
    const importPattern = new RegExp(
      `(from\\s+['"])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`,
      'g'
    );
    result = result.replace(importPattern, `$1${to}$2`);
  }
  
  // Transform sibling component imports (../component-name → ./component-name)
  // This handles cases like: import { Upload } from '../upload' → import { Upload } from './upload'
  const siblingImportPattern = /from\s+['"](\.\.\/([a-z][-a-z0-9]*)(?:\/[A-Z][a-zA-Z]*)?)['"]/g;
  result = result.replace(siblingImportPattern, (match, fullPath, componentFolder) => {
    // Convert to kebab-case and use relative import
    const kebabName = toKebabCase(componentFolder);
    return `from './${kebabName}'`;
  });

  return result;
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

/**
 * Generate origin header comment for copied files
 */
export function generateOriginHeader(
  componentName: string,
  sourcePackage: string,
  version: string = '1.0.0'
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `/**
 * @microbuild-origin ${sourcePackage}/${componentName}
 * @microbuild-version ${version}
 * @microbuild-date ${timestamp}
 * 
 * This file was copied from Microbuild UI Packages.
 * To update, run: npx @microbuild/cli add ${componentName} --overwrite
 * 
 * Docs: https://microbuild.dev/components/${componentName}
 */

`;
}

/**
 * Add origin header to file content
 */
export function addOriginHeader(
  content: string,
  componentName: string,
  sourcePackage: string,
  version: string = '1.0.0'
): string {
  const header = generateOriginHeader(componentName, sourcePackage, version);
  
  // If file has "use client", insert header after it
  const useClientMatch = content.match(/^(["']use client["'];?\s*\n)/);
  if (useClientMatch) {
    return useClientMatch[1] + header + content.slice(useClientMatch[0].length);
  }
  
  return header + content;
}

/**
 * Check if file has microbuild origin header
 */
export function hasMicrobuildOrigin(content: string): boolean {
  return content.includes('@microbuild-origin');
}

/**
 * Extract origin info from file
 */
export function extractOriginInfo(content: string): {
  origin?: string;
  version?: string;
  date?: string;
} | null {
  const originMatch = content.match(/@microbuild-origin\s+([^\n*]+)/);
  const versionMatch = content.match(/@microbuild-version\s+([^\n*]+)/);
  const dateMatch = content.match(/@microbuild-date\s+([^\n*]+)/);
  
  if (!originMatch) return null;
  
  return {
    origin: originMatch[1].trim(),
    version: versionMatch?.[1].trim(),
    date: dateMatch?.[1].trim(),
  };
}
