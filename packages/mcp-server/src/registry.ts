/**
 * Component Registry
 * 
 * Central registry of all Microbuild packages and components with metadata.
 * Used by both MCP server and CLI tool.
 */

export interface ComponentMetadata {
  name: string;
  package: string;
  category: 'input' | 'selection' | 'datetime' | 'boolean' | 'media' | 'relational' | 'layout' | 'rich-text';
  description: string;
  path: string;
  dependencies?: string[];
  peerDependencies?: string[];
  props?: Record<string, any>;
  examples?: string[];
}

export interface PackageMetadata {
  name: string;
  description: string;
  path: string;
  exports: string[];
  components?: ComponentMetadata[];
}

export const PACKAGES: PackageMetadata[] = [
  {
    name: '@microbuild/types',
    description: 'TypeScript type definitions for collections, fields, files, and relations',
    path: 'packages/types',
    exports: [
      'Field', 'FieldMeta', 'FieldSchema',
      'Collection', 'CollectionMeta',
      'Query', 'Filter',
      'Relation', 'RelationMeta',
      'DirectusFile', 'PrimaryKey', 'AnyItem'
    ]
  },
  {
    name: '@microbuild/services',
    description: 'CRUD service classes for items, fields, and collections',
    path: 'packages/services',
    exports: [
      'ItemsService',
      'FieldsService',
      'CollectionsService',
      'apiRequest'
    ]
  },
  {
    name: '@microbuild/hooks',
    description: 'React hooks for managing relational data',
    path: 'packages/hooks',
    exports: [
      'useRelationM2M',
      'useRelationM2MItems',
      'useRelationM2O',
      'useRelationM2OItem',
      'useRelationO2M',
      'useRelationO2MItems',
      'useRelationM2A',
      'useFiles',
      'api',
      'directusAPI'
    ]
  },
  {
    name: '@microbuild/ui-interfaces',
    description: 'Field interface components (inputs, selects, file uploads, etc.)',
    path: 'packages/ui-interfaces',
    exports: [],
    components: [
      // Input Components
      {
        name: 'Input',
        package: '@microbuild/ui-interfaces',
        category: 'input',
        description: 'Text input with validation',
        path: 'packages/ui-interfaces/src/input',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'Textarea',
        package: '@microbuild/ui-interfaces',
        category: 'input',
        description: 'Multi-line text input',
        path: 'packages/ui-interfaces/src/textarea',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'InputCode',
        package: '@microbuild/ui-interfaces',
        category: 'input',
        description: 'Code editor with syntax highlighting',
        path: 'packages/ui-interfaces/src/input-code',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'Tags',
        package: '@microbuild/ui-interfaces',
        category: 'input',
        description: 'Tag input with presets and custom tags',
        path: 'packages/ui-interfaces/src/tags',
        peerDependencies: ['@mantine/core', 'react']
      },
      
      // Selection Components
      {
        name: 'SelectDropdown',
        package: '@microbuild/ui-interfaces',
        category: 'selection',
        description: 'Dropdown select with search',
        path: 'packages/ui-interfaces/src/select-dropdown',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'SelectRadio',
        package: '@microbuild/ui-interfaces',
        category: 'selection',
        description: 'Radio button group',
        path: 'packages/ui-interfaces/src/select-radio',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'SelectMultipleCheckbox',
        package: '@microbuild/ui-interfaces',
        category: 'selection',
        description: 'Checkbox group with "other" option',
        path: 'packages/ui-interfaces/src/select-multiple-checkbox',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'SelectIcon',
        package: '@microbuild/ui-interfaces',
        category: 'selection',
        description: 'Icon picker with categorized Material icons',
        path: 'packages/ui-interfaces/src/select-icon',
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'AutocompleteAPI',
        package: '@microbuild/ui-interfaces',
        category: 'selection',
        description: 'External API-backed autocomplete',
        path: 'packages/ui-interfaces/src/autocomplete-api',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'CollectionItemDropdown',
        package: '@microbuild/ui-interfaces',
        category: 'selection',
        description: 'Collection item selector dropdown',
        path: 'packages/ui-interfaces/src/collection-item-dropdown',
        dependencies: ['@microbuild/services', '@microbuild/types'],
        peerDependencies: ['@mantine/core', 'react']
      },
      
      // Date/Time
      {
        name: 'DateTime',
        package: '@microbuild/ui-interfaces',
        category: 'datetime',
        description: 'Date, time, and datetime picker',
        path: 'packages/ui-interfaces/src/datetime',
        peerDependencies: ['@mantine/core', '@mantine/dates', 'react']
      },
      
      // Boolean
      {
        name: 'Boolean',
        package: '@microbuild/ui-interfaces',
        category: 'boolean',
        description: 'Checkbox toggle',
        path: 'packages/ui-interfaces/src/boolean',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'Toggle',
        package: '@microbuild/ui-interfaces',
        category: 'boolean',
        description: 'Enhanced switch toggle with icons and labels',
        path: 'packages/ui-interfaces/src/toggle',
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      
      // Media
      {
        name: 'FileInterface',
        package: '@microbuild/ui-interfaces',
        category: 'media',
        description: 'Single file upload',
        path: 'packages/ui-interfaces/src/file',
        dependencies: ['@microbuild/types'],
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'FileImage',
        package: '@microbuild/ui-interfaces',
        category: 'media',
        description: 'Image file picker with preview',
        path: 'packages/ui-interfaces/src/file-image',
        dependencies: ['@microbuild/types'],
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'Files',
        package: '@microbuild/ui-interfaces',
        category: 'media',
        description: 'Multiple file upload interface',
        path: 'packages/ui-interfaces/src/files',
        dependencies: ['@microbuild/types', '@microbuild/hooks'],
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'Upload',
        package: '@microbuild/ui-interfaces',
        category: 'media',
        description: 'Drag-and-drop file upload zone',
        path: 'packages/ui-interfaces/src/upload',
        peerDependencies: ['@mantine/core', '@mantine/dropzone', 'react']
      },
      {
        name: 'Color',
        package: '@microbuild/ui-interfaces',
        category: 'media',
        description: 'Color picker with RGB/HSL support and presets',
        path: 'packages/ui-interfaces/src/color',
        peerDependencies: ['@mantine/core', 'react']
      },
      
      // Relational
      {
        name: 'ListM2M',
        package: '@microbuild/ui-interfaces',
        category: 'relational',
        description: 'Many-to-Many relationship interface',
        path: 'packages/ui-interfaces/src/list-m2m',
        dependencies: ['@microbuild/types', '@microbuild/hooks', '@microbuild/services'],
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'ListM2O',
        package: '@microbuild/ui-interfaces',
        category: 'relational',
        description: 'Many-to-One relationship interface',
        path: 'packages/ui-interfaces/src/list-m2o',
        dependencies: ['@microbuild/types', '@microbuild/hooks', '@microbuild/services'],
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'ListO2M',
        package: '@microbuild/ui-interfaces',
        category: 'relational',
        description: 'One-to-Many relationship interface',
        path: 'packages/ui-interfaces/src/list-o2m',
        dependencies: ['@microbuild/types', '@microbuild/hooks', '@microbuild/services'],
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'ListM2A',
        package: '@microbuild/ui-interfaces',
        category: 'relational',
        description: 'Many-to-Any polymorphic relationship interface',
        path: 'packages/ui-interfaces/src/list-m2a',
        dependencies: ['@microbuild/types', '@microbuild/hooks', '@microbuild/services'],
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      
      // Layout
      {
        name: 'Divider',
        package: '@microbuild/ui-interfaces',
        category: 'layout',
        description: 'Horizontal/vertical divider with title support',
        path: 'packages/ui-interfaces/src/divider',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'Notice',
        package: '@microbuild/ui-interfaces',
        category: 'layout',
        description: 'Alert/notice component (info, success, warning, danger)',
        path: 'packages/ui-interfaces/src/notice',
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'GroupDetail',
        package: '@microbuild/ui-interfaces',
        category: 'layout',
        description: 'Collapsible form section',
        path: 'packages/ui-interfaces/src/group-detail',
        peerDependencies: ['@mantine/core', '@tabler/icons-react', 'react']
      },
      {
        name: 'Slider',
        package: '@microbuild/ui-interfaces',
        category: 'layout',
        description: 'Range slider with numeric type support',
        path: 'packages/ui-interfaces/src/slider',
        peerDependencies: ['@mantine/core', 'react']
      },
      
      // Rich Text
      {
        name: 'InputBlockEditor',
        package: '@microbuild/ui-interfaces',
        category: 'rich-text',
        description: 'Block-based content editor',
        path: 'packages/ui-interfaces/src/input-block-editor',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'RichTextHtml',
        package: '@microbuild/ui-interfaces',
        category: 'rich-text',
        description: 'WYSIWYG HTML editor with TipTap',
        path: 'packages/ui-interfaces/src/rich-text-html',
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'RichTextMarkdown',
        package: '@microbuild/ui-interfaces',
        category: 'rich-text',
        description: 'Markdown editor with live preview',
        path: 'packages/ui-interfaces/src/rich-text-markdown',
        peerDependencies: ['@mantine/core', 'react']
      }
    ]
  },
  {
    name: '@microbuild/ui-collections',
    description: 'Dynamic collection components (CollectionForm, CollectionList)',
    path: 'packages/ui-collections',
    exports: [],
    components: [
      {
        name: 'CollectionForm',
        package: '@microbuild/ui-collections',
        category: 'layout',
        description: 'Dynamic form that auto-renders fields based on collection schema',
        path: 'packages/ui-collections/src/collection-form',
        dependencies: ['@microbuild/types', '@microbuild/services', '@microbuild/ui-interfaces'],
        peerDependencies: ['@mantine/core', 'react']
      },
      {
        name: 'CollectionList',
        package: '@microbuild/ui-collections',
        category: 'layout',
        description: 'Dynamic table with pagination, search, selection, bulk actions',
        path: 'packages/ui-collections/src/collection-list',
        dependencies: ['@microbuild/types', '@microbuild/services'],
        peerDependencies: ['@mantine/core', 'react']
      }
    ]
  }
];

/**
 * Get all components across all packages
 */
export function getAllComponents(): ComponentMetadata[] {
  return PACKAGES.flatMap(pkg => pkg.components || []);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: string): ComponentMetadata[] {
  return getAllComponents().filter(c => c.category === category);
}

/**
 * Get component by name
 */
export function getComponent(name: string): ComponentMetadata | undefined {
  return getAllComponents().find(c => c.name === name);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  const categories = new Set(getAllComponents().map(c => c.category));
  return Array.from(categories);
}
