/**
 * Transformer Tests
 * 
 * Unit tests for the import transformation logic.
 * These tests ensure:
 * - @microbuild/* imports are correctly transformed to local paths
 * - Relative imports are normalized correctly
 * - VForm-specific transformations work
 * - Edge cases are handled
 */

import { describe, test, expect } from 'vitest';
import {
  transformImports,
  normalizeImportPaths,
  transformRelativeImports,
  transformIntraComponentImports,
  transformVFormImports,
  toKebabCase,
  toPascalCase,
  hasMicrobuildImports,
  extractOriginInfo,
  addOriginHeader,
} from '../src/commands/transformer.js';
import type { Config } from '../src/commands/init.js';

const defaultConfig: Config = {
  model: 'copy-own',
  tsx: true,
  srcDir: false,
  aliases: {
    components: '@/components/ui',
    lib: '@/lib/microbuild',
  },
  installedLib: [],
  installedComponents: [],
};

describe('transformImports', () => {
  test('transforms @microbuild/types imports', () => {
    const input = `import { Field, Collection } from '@microbuild/types';`;
    const expected = `import { Field, Collection } from '@/lib/microbuild/types';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms @microbuild/types subpath imports', () => {
    const input = `import type { FileInfo } from '@microbuild/types/file';`;
    const expected = `import type { FileInfo } from '@/lib/microbuild/types/file';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms @microbuild/services imports', () => {
    const input = `import { ItemsService } from '@microbuild/services';`;
    const expected = `import { ItemsService } from '@/lib/microbuild/services';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms @microbuild/hooks imports', () => {
    const input = `import { useRelationM2M } from '@microbuild/hooks';`;
    const expected = `import { useRelationM2M } from '@/lib/microbuild/hooks';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms @microbuild/ui-interfaces imports', () => {
    const input = `import { Input, Select } from '@microbuild/ui-interfaces';`;
    const expected = `import { Input, Select } from '@/components/ui';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms @microbuild/ui-form imports', () => {
    const input = `import { VForm } from '@microbuild/ui-form';`;
    const expected = `import { VForm } from '@/components/ui/vform';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms @microbuild/utils imports', () => {
    const input = `import { cn, formatFileSize } from '@microbuild/utils';`;
    const expected = `import { cn, formatFileSize } from '@/lib/microbuild/utils';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms import type statements', () => {
    const input = `import type { FormField } from '@microbuild/types';`;
    const expected = `import type { FormField } from '@/lib/microbuild/types';`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('handles multiple imports in one file', () => {
    const input = `
import { Field } from '@microbuild/types';
import { ItemsService } from '@microbuild/services';
import { VForm } from '@microbuild/ui-form';
`;
    const result = transformImports(input, defaultConfig);
    expect(result).toContain("from '@/lib/microbuild/types'");
    expect(result).toContain("from '@/lib/microbuild/services'");
    expect(result).toContain("from '@/components/ui/vform'");
  });

  test('does not transform non-microbuild imports', () => {
    const input = `import React from 'react';
import { Button } from '@mantine/core';`;
    expect(transformImports(input, defaultConfig)).toBe(input);
  });

  test('respects custom aliases', () => {
    const customConfig: Config = {
      ...defaultConfig,
      aliases: {
        components: '~/ui',
        lib: '~/shared',
      },
    };
    const input = `import { Field } from '@microbuild/types';`;
    const expected = `import { Field } from '~/shared/types';`;
    expect(transformImports(input, customConfig)).toBe(expected);
  });

  test('transforms dynamic imports for @microbuild/services', () => {
    const input = `const ItemsService = (await import('@microbuild/services')).ItemsService;`;
    const expected = `const ItemsService = (await import('@/lib/microbuild/services')).ItemsService;`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });

  test('transforms dynamic imports for @microbuild/hooks', () => {
    const input = `const hook = await import('@microbuild/hooks');`;
    const expected = `const hook = await import('@/lib/microbuild/hooks');`;
    expect(transformImports(input, defaultConfig)).toBe(expected);
  });
});

describe('normalizeImportPaths', () => {
  test('converts PascalCase import to kebab-case', () => {
    const input = `import { FileImage } from './FileImage';`;
    const expected = `import { FileImage } from './file-image';`;
    expect(normalizeImportPaths(input)).toBe(expected);
  });

  test('converts nested PascalCase path', () => {
    const input = `import { Upload } from '../Upload/Upload';`;
    const expected = `import { Upload } from './upload';`;
    expect(normalizeImportPaths(input)).toBe(expected);
  });

  test('preserves kebab-case imports', () => {
    const input = `import { Input } from './input';`;
    expect(normalizeImportPaths(input)).toBe(input);
  });

  test('skips files with preserve-casing directive', () => {
    const input = `// @microbuild-preserve-casing
import { FormField } from './FormField';`;
    expect(normalizeImportPaths(input)).toBe(input);
  });
});

describe('toKebabCase', () => {
  test('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('InputBlockEditor')).toBe('input-block-editor');
    expect(toKebabCase('FileImage')).toBe('file-image');
    // Note: VForm becomes 'vform' not 'v-form' because V is a single letter
    expect(toKebabCase('VForm')).toBe('vform');
  });

  test('converts camelCase to kebab-case', () => {
    expect(toKebabCase('inputCode')).toBe('input-code');
    expect(toKebabCase('richTextHtml')).toBe('rich-text-html');
  });

  test('handles already kebab-case', () => {
    expect(toKebabCase('input-code')).toBe('input-code');
  });

  test('handles single word', () => {
    expect(toKebabCase('Input')).toBe('input');
    expect(toKebabCase('input')).toBe('input');
  });
});

describe('toPascalCase', () => {
  test('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('input-block-editor')).toBe('InputBlockEditor');
    expect(toPascalCase('file-image')).toBe('FileImage');
  });

  test('handles single word', () => {
    expect(toPascalCase('input')).toBe('Input');
  });
});

describe('transformVFormImports', () => {
  test('preserves types import in components folder', () => {
    const input = `import type { FormField } from '../types';`;
    const result = transformVFormImports(
      input,
      'ui-form/src/components/FormField.tsx',
      'components/ui/vform/components/FormField.tsx'
    );
    expect(result).toContain("from '../types'");
  });

  test('handles root folder types import', () => {
    const input = `import type { FormField } from './types';`;
    const result = transformVFormImports(
      input,
      'ui-form/src/VForm.tsx',
      'components/ui/vform/VForm.tsx'
    );
    expect(result).toContain("from './types'");
  });
});

describe('transformRelativeImports', () => {
  test('transforms sibling imports from parent to current directory', () => {
    const input = `import { Upload } from '../upload';`;
    const result = transformRelativeImports(
      input,
      'ui-interfaces/src/file-image/FileImage.tsx',
      'components/ui/file-image.tsx',
      '@/components/ui'
    );
    expect(result).toContain("from './upload'");
  });
});

describe('hasMicrobuildImports', () => {
  test('returns true for @microbuild imports', () => {
    expect(hasMicrobuildImports("import { X } from '@microbuild/types'")).toBe(true);
    expect(hasMicrobuildImports("import { X } from '@microbuild/services'")).toBe(true);
    expect(hasMicrobuildImports("import { X } from '@microbuild/hooks'")).toBe(true);
  });

  test('returns false for non-microbuild imports', () => {
    expect(hasMicrobuildImports("import React from 'react'")).toBe(false);
    expect(hasMicrobuildImports("import { Button } from '@mantine/core'")).toBe(false);
  });
});

describe('addOriginHeader', () => {
  test('adds origin header to plain content', () => {
    const content = 'export const Component = () => {};';
    const result = addOriginHeader(content, 'input', '@microbuild/ui-interfaces', '1.0.0');
    
    expect(result).toContain('@microbuild-origin @microbuild/ui-interfaces/input');
    expect(result).toContain('@microbuild-version 1.0.0');
    expect(result).toContain('export const Component');
  });

  test('adds header after "use client" directive', () => {
    const content = '"use client";\n\nexport const Component = () => {};';
    const result = addOriginHeader(content, 'input', '@microbuild/ui-interfaces', '1.0.0');
    
    expect(result.startsWith('"use client"')).toBe(true);
    expect(result).toContain('@microbuild-origin');
    expect(result).toContain('export const Component');
  });
});

describe('extractOriginInfo', () => {
  test('extracts origin info from header', () => {
    const content = `/**
 * @microbuild-origin @microbuild/ui-interfaces/input
 * @microbuild-version 1.0.0
 * @microbuild-date 2024-01-15
 */
export const Input = () => {};`;

    const info = extractOriginInfo(content);
    
    expect(info).not.toBeNull();
    expect(info?.origin).toBe('@microbuild/ui-interfaces/input');
    expect(info?.version).toBe('1.0.0');
    expect(info?.date).toBe('2024-01-15');
  });

  test('returns null for content without origin', () => {
    const content = 'export const Input = () => {};';
    expect(extractOriginInfo(content)).toBeNull();
  });
});

// ─── VTable / Collection-List transform regression tests ─────────

const VTABLE_FILES = [
  { source: 'ui-table/src/VTable.tsx', target: 'components/ui/vtable.tsx' },
  { source: 'ui-table/src/VTable.css', target: 'components/ui/vtable.css' },
  { source: 'ui-table/src/components/TableHeader.tsx', target: 'components/ui/table-header.tsx' },
  { source: 'ui-table/src/components/TableHeader.css', target: 'components/ui/table-header.css' },
  { source: 'ui-table/src/components/TableRow.tsx', target: 'components/ui/table-row.tsx' },
  { source: 'ui-table/src/components/TableRow.css', target: 'components/ui/table-row.css' },
  { source: 'ui-table/src/types.ts', target: 'components/ui/vtable-types.ts' },
];

describe('transformIntraComponentImports (vtable)', () => {
  test('VTable.tsx: ./components/TableHeader → ./table-header', () => {
    const input = `import { TableHeader } from './components/TableHeader';`;
    const result = transformIntraComponentImports(
      input, 'ui-table/src/VTable.tsx', 'components/ui/vtable.tsx', VTABLE_FILES
    );
    expect(result).toBe(`import { TableHeader } from './table-header';`);
  });

  test('VTable.tsx: ./components/TableRow → ./table-row', () => {
    const input = `import { TableRow } from './components/TableRow';`;
    const result = transformIntraComponentImports(
      input, 'ui-table/src/VTable.tsx', 'components/ui/vtable.tsx', VTABLE_FILES
    );
    expect(result).toBe(`import { TableRow } from './table-row';`);
  });

  test('VTable.tsx: ./types → ./vtable-types', () => {
    const input = `import type { HeaderRaw, Header } from './types';\nimport { HeaderDefaults } from './types';`;
    const result = transformIntraComponentImports(
      input, 'ui-table/src/VTable.tsx', 'components/ui/vtable.tsx', VTABLE_FILES
    );
    expect(result).toBe(`import type { HeaderRaw, Header } from './vtable-types';\nimport { HeaderDefaults } from './vtable-types';`);
  });

  test('VTable.tsx: CSS import ./VTable.css → ./vtable.css', () => {
    const input = `import './VTable.css';`;
    const result = transformIntraComponentImports(
      input, 'ui-table/src/VTable.tsx', 'components/ui/vtable.tsx', VTABLE_FILES
    );
    expect(result).toBe(`import './vtable.css';`);
  });

  test('TableHeader.tsx: ../types → ./vtable-types', () => {
    const input = `import type { Header, Sort, ShowSelect } from '../types';`;
    const result = transformIntraComponentImports(
      input, 'ui-table/src/components/TableHeader.tsx', 'components/ui/table-header.tsx', VTABLE_FILES
    );
    expect(result).toBe(`import type { Header, Sort, ShowSelect } from './vtable-types';`);
  });

  test('TableHeader.tsx: CSS import ./TableHeader.css → ./table-header.css', () => {
    const input = `import './TableHeader.css';`;
    const result = transformIntraComponentImports(
      input, 'ui-table/src/components/TableHeader.tsx', 'components/ui/table-header.tsx', VTABLE_FILES
    );
    expect(result).toBe(`import './table-header.css';`);
  });

  test('TableRow.tsx: ../types → ./vtable-types', () => {
    const input = `import type { Header, Item, ShowSelect } from '../types';`;
    const result = transformIntraComponentImports(
      input, 'ui-table/src/components/TableRow.tsx', 'components/ui/table-row.tsx', VTABLE_FILES
    );
    expect(result).toBe(`import type { Header, Item, ShowSelect } from './vtable-types';`);
  });

  test('single-file component is skipped', () => {
    const input = `import { foo } from './bar';`;
    const singleFile = [{ source: 'pkg/Foo.tsx', target: 'components/ui/foo.tsx' }];
    const result = transformIntraComponentImports(input, 'pkg/Foo.tsx', 'components/ui/foo.tsx', singleFile);
    expect(result).toBe(input);
  });
});

describe('transformImports (@microbuild/ui-table)', () => {
  test('value import → componentsAlias/vtable', () => {
    const input = `import { VTable } from '@microbuild/ui-table';`;
    const result = transformImports(input, defaultConfig);
    expect(result).toBe(`import { VTable } from '@/components/ui/vtable';`);
  });

  test('type import → componentsAlias/vtable-types', () => {
    const input = `import type { HeaderRaw, Sort, Alignment, Header } from '@microbuild/ui-table';`;
    const result = transformImports(input, defaultConfig);
    expect(result).toBe(`import type { HeaderRaw, Sort, Alignment, Header } from '@/components/ui/vtable-types';`);
  });

  test('subpath import → componentsAlias/subpath', () => {
    const input = `import { something } from '@microbuild/ui-table/utils';`;
    const result = transformImports(input, defaultConfig);
    expect(result).toBe(`import { something } from '@/components/ui/utils';`);
  });

  test('hasMicrobuildImports detects @microbuild/ui-table', () => {
    expect(hasMicrobuildImports(`import { VTable } from '@microbuild/ui-table';`)).toBe(true);
  });
});
