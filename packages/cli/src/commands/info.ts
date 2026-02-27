/**
 * Buildpad CLI - Info Command
 * 
 * Show detailed information about a specific component including:
 * - Source files and locations
 * - Dependencies (npm, internal, and registry)
 * - Interface metadata
 */

import chalk from 'chalk';
import {
  getRegistry as fetchRegistry,
  type Registry,
  type FileMapping,
  type LibModule,
  type ComponentEntry,
} from '../resolver.js';

interface InterfaceMetadata {
  id: string;
  name: string;
  icon: string;
  types: string[];
  localTypes: string[];
  group: string;
  order: number;
  supported: boolean;
  recommended?: boolean;
  hasOptions: boolean;
}

// Extend ComponentEntry with interface metadata
interface ComponentEntryWithInterface extends ComponentEntry {
  interface?: InterfaceMetadata;
}

// Load registry (local or remote via resolver)
async function getRegistry(): Promise<Registry> {
  try {
    return await fetchRegistry();
  } catch (err: any) {
    console.error(chalk.red('Failed to load registry:', err.message));
    process.exit(1);
  }
}

/**
 * Find a component by name (case-insensitive, supports aliases)
 */
function findComponent(name: string, registry: Registry): ComponentEntry | undefined {
  const normalized = name.toLowerCase().replace(/-/g, '');
  
  // Direct match
  const direct = registry.components.find(
    c => c.name.toLowerCase() === name.toLowerCase() ||
         c.title.toLowerCase() === name.toLowerCase()
  );
  if (direct) return direct;
  
  // Fuzzy match (remove dashes)
  const fuzzy = registry.components.find(
    c => c.name.toLowerCase().replace(/-/g, '') === normalized ||
         c.title.toLowerCase().replace(/-/g, '') === normalized
  );
  if (fuzzy) return fuzzy;
  
  // Common aliases
  const aliases: Record<string, string> = {
    'form': 'vform',
    'dynamicform': 'vform',
    'select': 'select-dropdown',
    'dropdown': 'select-dropdown',
    'checkbox': 'boolean',
    'switch': 'toggle',
    'date': 'datetime',
    'time': 'datetime',
    'text': 'input',
    'textinput': 'input',
    'image': 'file-image',
    'wysiwyg': 'rich-text-html',
    'markdown': 'rich-text-markdown',
    'm2m': 'list-m2m',
    'm2o': 'list-m2o',
    'o2m': 'list-o2m',
    'm2a': 'list-m2a',
    'manytomany': 'list-m2m',
    'manytoone': 'list-m2o',
    'onetomany': 'list-o2m',
    'manytoany': 'list-m2a',
  };
  
  const aliased = aliases[normalized];
  if (aliased) {
    return registry.components.find(c => c.name === aliased);
  }
  
  return undefined;
}

/**
 * Calculate total dependencies recursively
 */
function calculateTotalDependencies(
  component: ComponentEntry, 
  registry: Registry, 
  visited = new Set<string>()
): { components: string[], libs: string[], npm: string[] } {
  if (visited.has(component.name)) {
    return { components: [], libs: [], npm: [] };
  }
  visited.add(component.name);
  
  const result = {
    components: [component.name],
    libs: [...component.internalDependencies],
    npm: [...component.dependencies],
  };
  
  // Add registry dependencies recursively
  if (component.registryDependencies) {
    for (const depName of component.registryDependencies) {
      const dep = registry.components.find(c => c.name === depName);
      if (dep) {
        const subDeps = calculateTotalDependencies(dep, registry, visited);
        result.components.push(...subDeps.components);
        result.libs.push(...subDeps.libs);
        result.npm.push(...subDeps.npm);
      }
    }
  }
  
  // Deduplicate
  return {
    components: [...new Set(result.components)],
    libs: [...new Set(result.libs)],
    npm: [...new Set(result.npm)],
  };
}

export async function info(componentName: string, options: { json?: boolean }) {
  const { json } = options;
  
  const registry = await getRegistry();
  const component = findComponent(componentName, registry);
  
  if (!component) {
    console.log(chalk.red(`\n✗ Component not found: ${componentName}\n`));
    
    // Suggest similar components
    const suggestions = registry.components
      .filter(c => 
        c.name.includes(componentName.toLowerCase()) ||
        c.title.toLowerCase().includes(componentName.toLowerCase()) ||
        c.description.toLowerCase().includes(componentName.toLowerCase())
      )
      .slice(0, 5);
    
    if (suggestions.length > 0) {
      console.log(chalk.yellow('Did you mean one of these?\n'));
      suggestions.forEach(s => {
        console.log(`  ${chalk.green(s.name.padEnd(25))} ${chalk.dim(s.description)}`);
      });
      console.log();
    }
    
    console.log(chalk.dim('Run "microbuild list" to see all available components.\n'));
    process.exit(1);
  }
  
  const totals = calculateTotalDependencies(component, registry);
  const category = registry.categories.find(c => c.name === component.category);
  
  if (json) {
    console.log(JSON.stringify({
      ...component,
      categoryTitle: category?.title,
      totalDependencies: totals,
    }, null, 2));
    return;
  }
  
  // Display component info
  console.log(chalk.bold.blue(`\n📦 ${component.title}`));
  console.log(chalk.dim(`   ${component.name} • ${category?.title || component.category}\n`));
  console.log(`${component.description}\n`);
  
  // Source files
  console.log(chalk.bold('📁 Source Files'));
  component.files.forEach(file => {
    console.log(`   ${chalk.green(file.source)}`);
    console.log(`   ${chalk.dim('→')} ${chalk.cyan(file.target)}`);
  });
  
  // Direct dependencies
  if (component.dependencies.length > 0) {
    console.log(chalk.bold('\n📦 NPM Dependencies'));
    console.log(`   ${chalk.yellow(component.dependencies.join(', '))}`);
  }
  
  if (component.internalDependencies.length > 0) {
    console.log(chalk.bold('\n🔧 Lib Modules'));
    component.internalDependencies.forEach(lib => {
      const libModule = registry.lib[lib];
      console.log(`   ${chalk.magenta(lib)} ${chalk.dim(`- ${libModule?.description || ''}`)}`);
    });
  }
  
  if (component.registryDependencies && component.registryDependencies.length > 0) {
    console.log(chalk.bold('\n🔗 Component Dependencies'));
    console.log(`   ${chalk.cyan(component.registryDependencies.length)} components will be installed:`);
    const chunks = [];
    for (let i = 0; i < component.registryDependencies.length; i += 6) {
      chunks.push(component.registryDependencies.slice(i, i + 6).join(', '));
    }
    chunks.forEach(chunk => console.log(`   ${chalk.dim(chunk)}`));
  }
  
  // Interface metadata
  if (component.interface) {
    console.log(chalk.bold('\n🎨 Interface Metadata'));
    console.log(`   ID: ${chalk.green(component.interface.id)}`);
    console.log(`   Icon: ${chalk.cyan(component.interface.icon)}`);
    console.log(`   Field Types: ${chalk.yellow(component.interface.types.join(', '))}`);
    if (component.interface.recommended) {
      console.log(`   ${chalk.green('★')} Recommended interface for its field types`);
    }
  }
  
  // Total impact
  console.log(chalk.bold('\n📊 Installation Summary'));
  console.log(`   Components: ${chalk.green(totals.components.length)}`);
  console.log(`   Lib modules: ${chalk.green(totals.libs.length)} ${chalk.dim(`(${totals.libs.join(', ') || 'none'})`)}`);
  console.log(`   NPM packages: ${chalk.yellow(totals.npm.length)}`);
  
  // Usage
  console.log(chalk.bold('\n💡 Usage'));
  console.log(chalk.dim(`   microbuild add ${component.name}`));
  console.log(chalk.dim(`   microbuild tree ${component.name}\n`));
}
