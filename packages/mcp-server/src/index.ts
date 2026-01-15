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
  getRegistry,
  type ComponentMetadata,
} from './registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the packages root (mcp-server/dist -> packages)
const PACKAGES_ROOT = join(__dirname, '../..');

/**
 * Read file content safely
 * Handles both direct file paths (e.g., ui-interfaces/src/datetime/DateTime.tsx)
 * and directory paths (tries index.tsx, index.ts variants)
 */
function readSourceFile(relativePath: string): string | null {
  const fullPath = join(PACKAGES_ROOT, relativePath);
  
  // First, try the exact path (for explicit file paths like DateTime.tsx)
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  
  // If path doesn't exist as-is, try as directory with index files
  const extensions = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'];
  
  for (const ext of extensions) {
    const filePath = join(fullPath, ext);
    if (existsSync(filePath)) {
      return readFileSync(filePath, 'utf-8');
    }
  }
  
  return null;
}

/**
 * Generate component usage example
 * Uses Copy & Own style - components are imported from local project paths
 */
function generateUsageExample(component: ComponentMetadata): string {
  const examples: Record<string, string> = {
    Input: `// Copy & Own: Component must be added via CLI from local microbuild-ui-packages
// cd /path/to/microbuild-ui-packages && pnpm cli add input --project /path/to/your-project
import { Input } from '@/components/ui/input';

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
    SelectDropdown: `// Copy & Own: cd /path/to/microbuild-ui-packages && pnpm cli add select-dropdown --project /path/to/your-project
import { SelectDropdown } from '@/components/ui/select-dropdown';

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
    DateTime: `// Copy & Own: cd /path/to/microbuild-ui-packages && pnpm cli add datetime --project /path/to/your-project
import { DateTime } from '@/components/ui/datetime';

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
    Toggle: `// Copy & Own: cd /path/to/microbuild-ui-packages && pnpm cli add toggle --project /path/to/your-project
import { Toggle } from '@/components/ui/toggle';

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
    CollectionForm: `// Copy & Own: cd /path/to/microbuild-ui-packages && pnpm cli add collection-form --project /path/to/your-project
import { CollectionForm } from '@/components/ui/collection-form';

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
    CollectionList: `// Copy & Own: cd /path/to/microbuild-ui-packages && pnpm cli add collection-list --project /path/to/your-project
import { CollectionList } from '@/components/ui/collection-list';

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

  return examples[component.name] || examples[component.title] || `// Copy & Own model: This component is copied to your project
// Import from your local components directory after running from microbuild-ui-packages:
// cd /path/to/microbuild-ui-packages && pnpm cli add ${component.name} --project /path/to/your-project

import { ${component.title} } from '@/components/ui/${component.name}';

function Example() {
  const [value, setValue] = useState(null);

  return (
    <${component.title}
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
      name: component.title,
      description: `${component.description} (${component.category})`,
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

    // Get source from first file in files array
    const sourcePath = component.files[0]?.source;
    const source = sourcePath ? readSourceFile(sourcePath) : null;

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
      {
        name: 'get_install_command',
        description: 'Get the CLI command to install components using Copy & Own model. Returns the exact command to run.',
        inputSchema: {
          type: 'object',
          properties: {
            components: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of component names to install (e.g., ["input", "select-dropdown", "datetime"])',
            },
            category: {
              type: 'string',
              description: 'Install all components from a category instead',
              enum: ['input', 'selection', 'datetime', 'boolean', 'media', 'relational', 'layout', 'rich-text', 'collection'],
            },
            all: {
              type: 'boolean',
              description: 'Install all available components',
            },
          },
        },
      },
      {
        name: 'get_copy_own_info',
        description: 'Get information about the Copy & Own distribution model and how to use it',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'copy_component',
        description: 'Get complete source code and file structure to manually copy a component into your project (shadcn-style). Returns the full implementation code, target paths, and required dependencies.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (e.g., "datetime", "input", "select-dropdown")',
            },
            includeLib: {
              type: 'boolean',
              description: 'Also include required lib modules (types, services, hooks) if the component depends on them',
            },
          },
          required: ['name'],
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

      // Get source from all files in files array (for components with multiple files)
      const sources: Record<string, string> = {};
      for (const file of component.files) {
        const content = readSourceFile(file.source);
        if (content) {
          sources[file.target] = content;
        }
      }

      // Primary source is the first file
      const primarySource = component.files[0]?.source;
      const source = primarySource ? readSourceFile(primarySource) : null;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ...component,
                source: source || 'Source code not available',
                allSources: sources,
                installCommand: `cd /path/to/microbuild-ui-packages && pnpm cli add ${component.name} --project /path/to/your-project`,
                installNote: '⚠️ @microbuild/cli is NOT on npm. You must use the CLI from a local clone of microbuild-ui-packages.',
                copyOwn: {
                  description: 'Copy this component to your project using the CLI from microbuild-ui-packages, or manually copy the source code below.',
                  targetPath: component.files[0]?.target || `components/ui/${component.name}.tsx`,
                  peerDependencies: component.dependencies,
                },
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
      
      const code = `// Copy & Own: cd /path/to/microbuild-ui-packages && pnpm cli add collection-form --project /path/to/your-project
import { CollectionForm } from '@/components/ui/collection-form';

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

      const code = `// Copy & Own: cd /path/to/microbuild-ui-packages && pnpm cli add ${type} --project /path/to/your-project
import { ${componentName} } from '@/components/ui/${type}';
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

    case 'get_install_command': {
      const { components, category, all } = args as any;
      
      // NOTE: @microbuild/cli is NOT published to npm. Must use local CLI from cloned repo
      let command = 'cd /path/to/microbuild-ui-packages && pnpm cli add';
      let explanation = '';
      
      if (all) {
        command += ' --all --project /path/to/your-project';
        explanation = 'This will install all Microbuild components to your project.';
      } else if (category) {
        command += ` --category ${category} --project /path/to/your-project`;
        explanation = `This will install all components from the ${category} category.`;
      } else if (components && components.length > 0) {
        command += ` ${components.join(' ')} --project /path/to/your-project`;
        explanation = `This will install: ${components.join(', ')}.`;
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ **IMPORTANT:** @microbuild/cli is NOT published to npm. You must use the CLI from a local clone.

**Prerequisites:**
1. Clone microbuild-ui-packages: \`git clone <repo-url> microbuild-ui-packages\`
2. Install & build: \`cd microbuild-ui-packages && pnpm install && pnpm build\`

**Examples (run from microbuild-ui-packages directory):**
- \`pnpm cli add input select-dropdown --project /path/to/your-project\`
- \`pnpm cli add --category selection --project /path/to/your-project\`
- \`pnpm cli add --all --project /path/to/your-project\``,
            },
          ],
        };
      }

      const result = `## Copy & Own Installation

⚠️ **IMPORTANT:** @microbuild/cli is NOT published to npm.
You must use the CLI from a local clone of microbuild-ui-packages.

**Prerequisites:**
1. Clone the repo: \`git clone <repo-url> microbuild-ui-packages\`
2. Install deps: \`cd microbuild-ui-packages && pnpm install\`
3. Build CLI: \`pnpm build:cli\`

**Command (from microbuild-ui-packages directory):**
\`\`\`bash
${command}
\`\`\`

${explanation}

**What happens:**
1. Components are copied to your project (default: @/components/ui/)
2. Internal dependencies (types, services, hooks) are copied to @/lib/microbuild/
3. Imports are transformed to use local paths
4. Dependencies are tracked in microbuild.json

**First time setup (from microbuild-ui-packages directory):**
\`\`\`bash
pnpm cli init --project /path/to/your-project
\`\`\`

**Benefits of Copy & Own:**
✅ No external package dependencies for component code
✅ Full customization - components become your application code
✅ No breaking changes from upstream updates
✅ Bundle only what you use
✅ Works offline after installation`;

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    }

    case 'get_copy_own_info': {
      const info = `## Microbuild Copy & Own Distribution Model

Microbuild uses the **Copy & Own** model (like shadcn/ui) instead of traditional npm packages.

⚠️ **IMPORTANT:** @microbuild/cli is NOT published to npm.
You must clone microbuild-ui-packages locally and use the CLI from there.

### Prerequisites:
1. Clone: \`git clone <repo-url> microbuild-ui-packages\`
2. Install: \`cd microbuild-ui-packages && pnpm install\`
3. Build: \`pnpm build\`

### How it works (all commands from microbuild-ui-packages directory):
1. **Initialize:** \`pnpm cli init --project /path/to/your-project\`
2. **Add components:** \`pnpm cli add input select-dropdown --project /path/to/your-project\`
3. **Customize:** Components are copied as source code - modify freely!

### Project Structure After Installation:
\`\`\`
your-project/
├── components/
│   └── ui/
│       ├── input.tsx          # Copied component
│       ├── select-dropdown.tsx
│       └── collection-form.tsx
├── lib/
│   └── microbuild/
│       ├── types/            # Type definitions
│       ├── services/         # API services
│       └── hooks/            # React hooks
└── microbuild.json           # Tracks installed components
\`\`\`

### CLI Commands (from microbuild-ui-packages directory):
- \`pnpm cli init --project <path>\` - Initialize project
- \`pnpm cli list\` - List available components
- \`pnpm cli add <components> --project <path>\` - Install components
- \`pnpm cli add --category <name> --project <path>\` - Install by category
- \`pnpm cli diff <component> --project <path>\` - Preview before install
- \`pnpm cli status --project <path>\` - Check installed components

### Benefits:
✅ **No external dependencies** - Components are part of your codebase
✅ **Full customization** - Modify components to fit your needs
✅ **No breaking changes** - You control when to update
✅ **Tree-shaking friendly** - Only bundle what you use
✅ **Works offline** - No network required after installation

### Categories:
- \`input\` - Text inputs, textareas, code editors
- \`selection\` - Dropdowns, checkboxes, radio buttons
- \`datetime\` - Date and time pickers
- \`boolean\` - Toggles and checkboxes
- \`media\` - File uploads, image pickers
- \`relational\` - M2M, M2O, O2M relationship interfaces
- \`layout\` - Dividers, notices, accordions
- \`rich-text\` - HTML and Markdown editors
- \`collection\` - CollectionForm, CollectionList`;

      return {
        content: [
          {
            type: 'text',
            text: info,
          },
        ],
      };
    }

    case 'copy_component': {
      const componentName = (args as any)?.name;
      const includeLib = (args as any)?.includeLib ?? true;
      
      if (!componentName) {
        throw new Error('Component name is required');
      }

      const component = getComponent(componentName);
      if (!component) {
        throw new Error(`Component not found: ${componentName}`);
      }

      // Collect all files for this component
      const files: Array<{ path: string; content: string }> = [];
      
      for (const file of component.files) {
        const content = readSourceFile(file.source);
        if (content) {
          files.push({
            path: file.target,
            content: content,
          });
        }
      }

      // If includeLib and component has internal dependencies, include those too
      const libFiles: Array<{ path: string; content: string; module: string }> = [];
      
      if (includeLib && component.internalDependencies?.length > 0) {
        const registry = getRegistry();
        
        for (const dep of component.internalDependencies) {
          const libModule = registry.lib[dep];
          if (libModule) {
            if (libModule.files) {
              for (const file of libModule.files) {
                const content = readSourceFile(file.source);
                if (content) {
                  libFiles.push({
                    path: file.target,
                    content: content,
                    module: dep,
                  });
                }
              }
            } else if (libModule.path && libModule.target) {
              const content = readSourceFile(libModule.path);
              if (content) {
                libFiles.push({
                  path: libModule.target,
                  content: content,
                  module: dep,
                });
              }
            }
          }
        }
      }

      const result = {
        component: component.name,
        title: component.title,
        description: component.description,
        
        // Primary component file
        files: files,
        
        // Required lib modules (if any)
        libFiles: libFiles.length > 0 ? libFiles : undefined,
        
        // Dependencies to install via npm/pnpm
        peerDependencies: component.dependencies,
        
        // Install command (must use local CLI, not npx)
        cliCommand: `cd /path/to/microbuild-ui-packages && pnpm cli add ${component.name} --project /path/to/your-project`,
        cliNote: '⚠️ @microbuild/cli is NOT on npm. You must use the CLI from a local clone of microbuild-ui-packages.',
        
        // Instructions
        instructions: `## Copy & Own: ${component.title}

⚠️ **IMPORTANT:** @microbuild/cli is NOT published to npm.
You must use the CLI from a local clone of microbuild-ui-packages.

### Option 1: Use CLI (Recommended)

**Prerequisites:**
1. Clone microbuild-ui-packages: \`git clone <repo-url>\`
2. Install & build: \`cd microbuild-ui-packages && pnpm install && pnpm build\`

**Add component (from microbuild-ui-packages directory):**
\`\`\`bash
pnpm cli add ${component.name} --project /path/to/your-project
\`\`\`

### Option 2: Manual Copy
1. Copy the component file(s) to your project:
${files.map(f => `   - \`${f.path}\``).join('\n')}
${libFiles.length > 0 ? `
2. Copy required lib modules:
${libFiles.map(f => `   - \`${f.path}\` (${f.module})`).join('\n')}` : ''}

${component.dependencies.length > 0 ? `3. Install peer dependencies:
\`\`\`bash
pnpm add ${component.dependencies.join(' ')}
\`\`\`` : ''}

### Usage
\`\`\`tsx
import { ${component.title} } from '@/components/ui/${component.name}';
\`\`\`
`,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
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
