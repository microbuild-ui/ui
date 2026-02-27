/**
 * Import Transformer
 * 
 * Transforms @microbuild/* imports to local path aliases.
 * This is the core of the Copy & Own model - making copied files self-contained.
 */

import path from 'path';
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
    // UI Table (VTable - type-import pattern MUST come before general pattern
    // so type imports resolve to vtable-types while value imports resolve to vtable)
    {
      from: /import type \{([^}]+)\} from ['"]@microbuild\/ui-table['"]/g,
      to: `import type {$1} from '${componentsAlias}/vtable-types'`,
    },
    {
      from: /from ['"]@microbuild\/ui-table['"]/g,
      to: `from '${componentsAlias}/vtable'`,
    },
    {
      from: /from ['"]@microbuild\/ui-table\/([^'"]+)['"]/g,
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
    // Dynamic imports - import('@microbuild/services') etc.
    {
      from: /import\s*\(\s*['"]@microbuild\/services['"]\s*\)/g,
      to: `import('${libAlias}/services')`,
    },
    {
      from: /import\s*\(\s*['"]@microbuild\/hooks['"]\s*\)/g,
      to: `import('${libAlias}/hooks')`,
    },
    {
      from: /import\s*\(\s*['"]@microbuild\/types['"]\s*\)/g,
      to: `import('${libAlias}/types')`,
    },
    {
      from: /import\s*\(\s*['"]@microbuild\/utils['"]\s*\)/g,
      to: `import('${libAlias}/utils')`,
    },
  ];
}

/**
 * Transform a file's content by replacing @microbuild/* imports with local paths
 * Also normalizes import paths to use consistent kebab-case file names
 * 
 * @param content - File content to transform
 * @param config - Buildpad config
 * @param targetPath - Optional target path for context-aware transformations
 */
export function transformImports(content: string, config: Config, targetPath?: string): string {
  const mappings = getImportMappings(config);
  let result = content;

  for (const mapping of mappings) {
    result = result.replace(mapping.from, mapping.to);
  }

  // Normalize any PascalCase import paths to kebab-case (skips VForm folder)
  result = normalizeImportPaths(result, targetPath);

  return result;
}

/**
 * Transform internal component imports
 * e.g., import { CollectionList } from '@microbuild/ui-collections' 
 *    -> import { CollectionList } from '@/components/ui/collection-list'
 */
export function transformComponentImports(
  content: string,
  _componentName: string,
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
 * Normalize import paths to use consistent kebab-case file names
 * Fixes issues where imports use PascalCase but files are kebab-case
 * 
 * EXCEPTION: VForm folder preserves PascalCase imports because its files
 * are copied with original casing (VForm.tsx, FormField.tsx, etc.)
 * 
 * Examples:
 *   ./InputBlockEditor → ./input-block-editor
 *   ./FileImage → ./file-image
 *   ../Upload/Upload → ./upload
 *   dynamic import('./InputBlockEditor') → import('./input-block-editor')
 *   
 * Files marked with @microbuild-preserve-casing are not normalized.
 */
export function normalizeImportPaths(content: string, targetPath?: string): string {
  // Skip normalization for files that preserve casing
  if (content.includes('@microbuild-preserve-casing')) {
    return content;
  }
  
  // Skip normalization for VForm folder files (they use PascalCase filenames)
  if (targetPath && (
    targetPath.includes('/vform/') || 
    targetPath.includes('/ui-form/') ||
    targetPath.includes('VForm') ||
    targetPath.includes('FormField')
  )) {
    return content;
  }
  
  // Pattern matches relative imports with PascalCase filenames
  // e.g., from './InputBlockEditor' or from '../Upload/Upload'
  const pascalCaseImportPattern = /from\s+['"](\.\.\/?|\.\/)([A-Z][a-zA-Z0-9]*(?:\/[A-Z][a-zA-Z0-9]*)?)['"]/g;
  
  let result = content.replace(pascalCaseImportPattern, (_match, prefix, importPath) => {
    // Extract the last component (filename) from the path
    const parts = importPath.split('/');
    const fileName = parts[parts.length - 1];
    
    // Convert to kebab-case
    const kebabFileName = toKebabCase(fileName);
    
    // If it was a nested path like '../Upload/Upload', flatten to './upload'
    if (prefix === '../' && parts.length >= 1) {
      return `from './${kebabFileName}'`;
    }
    
    // Otherwise, just convert the filename
    return `from '${prefix}${kebabFileName}'`;
  });
  
  // Handle dynamic imports: import('./InputBlockEditor') → import('./input-block-editor')
  // This pattern matches: import('./ComponentName') or import("./ComponentName")
  const dynamicImportPattern = /import\s*\(\s*['"](\.\/)([A-Z][a-zA-Z0-9]*)['"]\s*\)/g;
  
  result = result.replace(dynamicImportPattern, (_match, prefix, componentName) => {
    const kebabName = toKebabCase(componentName);
    return `import('${prefix}${kebabName}')`;
  });
  
  return result;
}

/**
 * Transform relative imports within a multi-file component using the registry
 * file mappings. Resolves each relative import against the source file's location,
 * looks up the corresponding target path, and rewrites the import to point to
 * the correct target-relative path.
 *
 * Handles both module imports (`from './...'`) and side-effect imports (`import './...'` for CSS).
 */
export function transformIntraComponentImports(
  content: string,
  sourceFile: string,
  targetFile: string,
  fileMappings: Array<{ source: string; target: string }>
): string {
  // Only useful for multi-file components
  if (!fileMappings || fileMappings.length <= 1) return content;

  const sourceDir = path.posix.dirname(sourceFile);
  const targetDir = path.posix.dirname(targetFile);

  // Build lookup: resolved source path (no extension) → target path (no extension)
  const sourceToTarget = new Map<string, string>();
  // Build lookup: resolved source path (with extension) → target path (with extension)
  const sourceToTargetExt = new Map<string, string>();

  for (const fm of fileMappings) {
    sourceToTarget.set(fm.source.replace(/\.\w+$/, ''), fm.target.replace(/\.\w+$/, ''));
    sourceToTargetExt.set(fm.source, fm.target);
  }

  // Pattern 1: `from './...'` or `from '../...'` (JS/TS module imports)
  let result = content.replace(
    /from\s+(['"])(\.[^'"]+)\1/g,
    (match, _quote, importPath) => {
      const resolved = path.posix.join(sourceDir, importPath);
      // Try with and without extension stripping
      const resolvedNoExt = resolved.replace(/\.\w+$/, '');
      const mapped = sourceToTarget.get(resolvedNoExt) ?? sourceToTarget.get(resolved);
      if (mapped) {
        let rel = path.posix.relative(targetDir, mapped);
        if (!rel.startsWith('.')) rel = './' + rel;
        return match.replace(importPath, rel);
      }
      return match;
    }
  );

  // Pattern 2: `import './...'` (CSS/side-effect imports, no `from`)
  result = result.replace(
    /import\s+(['"])(\.[^'"]+)\1/g,
    (match, _quote, importPath) => {
      // Skip if it looks like a `from` import (already handled above)
      // This regex only fires for bare `import '...'` statements
      const resolved = path.posix.join(sourceDir, importPath);
      // Try with extension first (CSS files keep extensions)
      const mappedExt = sourceToTargetExt.get(resolved);
      if (mappedExt) {
        let rel = path.posix.relative(targetDir, mappedExt);
        if (!rel.startsWith('.')) rel = './' + rel;
        return match.replace(importPath, rel);
      }
      // Fallback: try without extension
      const resolvedNoExt = resolved.replace(/\.\w+$/, '');
      const mapped = sourceToTarget.get(resolvedNoExt);
      if (mapped) {
        let rel = path.posix.relative(targetDir, mapped);
        if (!rel.startsWith('.')) rel = './' + rel;
        return match.replace(importPath, rel);
      }
      return match;
    }
  );

  return result;
}

/**
 * Check if content has @microbuild/* imports
 */
export function hasBuildpadImports(content: string): boolean {
  return /@microbuild\/(types|services|hooks|utils|ui-interfaces|ui-collections|ui-form|ui-table)/.test(content);
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
  _targetFile: string
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
  _sourceFile: string,
  _targetFile: string,
  _componentsAlias: string
): string {
  let result = content;
  
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
  result = result.replace(siblingImportPattern, (_match, _fullPath, componentFolder) => {
    // Convert to kebab-case and use relative import
    const kebabName = toKebabCase(componentFolder);
    return `from './${kebabName}'`;
  });

  return result;
}

/**
 * Extract which @microbuild/* packages are imported
 */
export function extractBuildpadDependencies(content: string): string[] {
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
 * This file was copied from Buildpad UI Packages.
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
export function hasBuildpadOrigin(content: string): boolean {
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
