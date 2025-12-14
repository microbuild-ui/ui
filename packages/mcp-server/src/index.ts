#!/usr/bin/env node
/**
 * Microbuild MCP Server
 * 
 * Exposes Microbuild components to AI agents via the Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  PACKAGES,
  getAllComponents,
  getComponent,
  getComponentsByCategory,
  getCategories,
  type ComponentMetadata,
} from './registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the workspace root (3 levels up from dist)
const WORKSPACE_ROOT = join(__dirname, '../../..');

/**
 * Read file content safely
 */
function readSourceFile(relativePath: string): string | null {
  const fullPath = join(WORKSPACE_ROOT, relativePath);
  
  // Try different file extensions
  const extensions = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'];
  
  for (const ext of extensions) {
    const filePath = join(fullPath, ext);
    if (existsSync(filePath)) {
      return readFileSync(filePath, 'utf-8');
    }
  }
  
  // Try direct path
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  
  return null;
}

/**
 * Generate component usage example
 */
function generateUsageExample(component: ComponentMetadata): string {
  const examples: Record<string, string> = {
    Input: `import { Input } from '@microbuild/ui-interfaces';

function MyForm() {
  const [value, setValue] = useState('');

  return (
    <Input
      field="title"
      value={value}
      onChange={setValue}
      placeholder="Enter title"
      required
    />
  );
}`,
    SelectDropdown: `import { SelectDropdown } from '@microbuild/ui-interfaces';

function StatusSelect() {
  const [status, setStatus] = useState('draft');

  return (
    <SelectDropdown
      field="status"
      value={status}
      onChange={setStatus}
      choices={[
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
        { text: 'Archived', value: 'archived' },
      ]}
    />
  );
}`,
    DateTime: `import { DateTime } from '@microbuild/ui-interfaces';

function EventForm() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <DateTime
      field="event_date"
      value={date}
      onChange={setDate}
      type="datetime"
      label="Event Date & Time"
    />
  );
}`,
    Toggle: `import { Toggle } from '@microbuild/ui-interfaces';

function FeatureToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Toggle
      field="featured"
      value={enabled}
      onChange={setEnabled}
      label="Featured Product"
      iconOn="IconStar"
      iconOff="IconStarOff"
    />
  );
}`,
    CollectionForm: `import { CollectionForm } from '@microbuild/ui-collections';

function ProductEditor({ productId }: { productId?: string }) {
  return (
    <CollectionForm
      collection="products"
      id={productId}
      mode={productId ? 'edit' : 'create'}
      onSuccess={(data) => console.log('Saved:', data)}
      excludeFields={['internal_notes']}
    />
  );
}`,
    CollectionList: `import { CollectionList } from '@microbuild/ui-collections';

function ProductList() {
  return (
    <CollectionList
      collection="products"
      fields={['title', 'status', 'price', 'created_at']}
      enableSelection
      enableSearch
      onItemClick={(item) => router.push(\`/products/\${item.id}\`)}
    />
  );
}`,
  };

  return examples[component.name] || `import { ${component.name} } from '${component.package}';

// Usage example for ${component.name}
function Example() {
  const [value, setValue] = useState(null);

  return (
    <${component.name}
      field="fieldName"
      value={value}
      onChange={setValue}
    />
  );
}`;
}

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: 'microbuild-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * List all available resources (packages and components)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = [];

  // Add package resources
  for (const pkg of PACKAGES) {
    resources.push({
      uri: `microbuild://packages/${pkg.name}`,
      name: pkg.name,
      description: pkg.description,
      mimeType: 'application/json',
    });
  }

  // Add component resources
  for (const component of getAllComponents()) {
    resources.push({
      uri: `microbuild://components/${component.name}`,
      name: component.name,
      description: `${component.description} (${component.package})`,
      mimeType: 'text/plain',
    });
  }

  return { resources };
});

/**
 * Read resource content (package info or component source)
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  // Handle package info requests
  if (uri.startsWith('microbuild://packages/')) {
    const packageName = uri.replace('microbuild://packages/', '');
    const pkg = PACKAGES.find(p => p.name === packageName);

    if (!pkg) {
      throw new Error(`Package not found: ${packageName}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(pkg, null, 2),
        },
      ],
    };
  }

  // Handle component source requests
  if (uri.startsWith('microbuild://components/')) {
    const componentName = uri.replace('microbuild://components/', '');
    const component = getComponent(componentName);

    if (!component) {
      throw new Error(`Component not found: ${componentName}`);
    }

    const source = readSourceFile(component.path);

    if (!source) {
      throw new Error(`Source file not found for component: ${componentName}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: source,
        },
      ],
    };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_components',
        description: 'List all available Microbuild components with metadata',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category (input, selection, datetime, boolean, media, relational, layout, rich-text)',
              enum: getCategories(),
            },
          },
        },
      },
      {
        name: 'get_component',
        description: 'Get detailed information and source code for a specific component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (e.g., Input, SelectDropdown, CollectionForm)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_usage_example',
        description: 'Get a usage example for a component',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              description: 'Component name',
            },
          },
          required: ['component'],
        },
      },
      {
        name: 'generate_form',
        description: 'Generate a CollectionForm component with specified configuration',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Fields to include in the form',
            },
            mode: {
              type: 'string',
              enum: ['create', 'edit'],
              description: 'Form mode',
            },
          },
          required: ['collection'],
        },
      },
      {
        name: 'generate_interface',
        description: 'Generate code for a field interface component',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Interface type (input, select-dropdown, datetime, toggle, etc.)',
            },
            field: {
              type: 'string',
              description: 'Field name',
            },
            props: {
              type: 'object',
              description: 'Additional props for the component',
            },
          },
          required: ['type', 'field'],
        },
      },
      {
        name: 'list_packages',
        description: 'List all Microbuild packages with their exports',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'list_components': {
      const category = (args as any)?.category;
      const components = category
        ? getComponentsByCategory(category)
        : getAllComponents();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(components, null, 2),
          },
        ],
      };
    }

    case 'get_component': {
      const componentName = (args as any)?.name;
      if (!componentName) {
        throw new Error('Component name is required');
      }

      const component = getComponent(componentName);
      if (!component) {
        throw new Error(`Component not found: ${componentName}`);
      }

      const source = readSourceFile(component.path);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ...component,
                source: source || 'Source code not available',
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'get_usage_example': {
      const componentName = (args as any)?.component;
      if (!componentName) {
        throw new Error('Component name is required');
      }

      const component = getComponent(componentName);
      if (!component) {
        throw new Error(`Component not found: ${componentName}`);
      }

      const example = generateUsageExample(component);

      return {
        content: [
          {
            type: 'text',
            text: example,
          },
        ],
      };
    }

    case 'generate_form': {
      const { collection, fields, mode } = args as any;
      
      const code = `import { CollectionForm } from '@microbuild/ui-collections';

function ${collection.charAt(0).toUpperCase() + collection.slice(1)}Form() {
  return (
    <CollectionForm
      collection="${collection}"
      mode="${mode || 'create'}"
      ${fields ? `includeFields={${JSON.stringify(fields)}}` : ''}
      onSuccess={(data) => {
        console.log('Saved:', data);
      }}
    />
  );
}`;

      return {
        content: [
          {
            type: 'text',
            text: code,
          },
        ],
      };
    }

    case 'generate_interface': {
      const { type, field, props = {} } = args as any;

      // Map interface type to component name
      const componentMap: Record<string, string> = {
        'input': 'Input',
        'textarea': 'Textarea',
        'select-dropdown': 'SelectDropdown',
        'datetime': 'DateTime',
        'toggle': 'Toggle',
        'boolean': 'Boolean',
        'file': 'FileInterface',
        'file-image': 'FileImage',
      };

      const componentName = componentMap[type] || 'Input';
      const propsStr = Object.entries(props)
        .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
        .join('\n      ');

      const code = `import { ${componentName} } from '@microbuild/ui-interfaces';
import { useState } from 'react';

function Example() {
  const [value, setValue] = useState(null);

  return (
    <${componentName}
      field="${field}"
      value={value}
      onChange={setValue}
      ${propsStr}
    />
  );
}`;

      return {
        content: [
          {
            type: 'text',
            text: code,
          },
        ],
      };
    }

    case 'list_packages': {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(PACKAGES, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Microbuild MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
