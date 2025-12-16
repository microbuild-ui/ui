import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadConfig } from './init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get packages root (packages/cli/dist/commands -> packages)
const PACKAGES_ROOT = path.resolve(__dirname, '../..');

interface ComponentEntry {
  name: string;
  title: string;
  category: string;
  description: string;
  internalDependencies: string[];
  dependencies: string[];
}

interface CategoryEntry {
  name: string;
  title: string;
  description: string;
}

interface Registry {
  version: string;
  name: string;
  components: ComponentEntry[];
  categories: CategoryEntry[];
}

// Load registry from shared JSON file
async function getRegistry(): Promise<Registry> {
  const registryPath = path.join(PACKAGES_ROOT, 'registry.json');
  
  if (!fs.existsSync(registryPath)) {
    console.error(chalk.red('Registry file not found:', registryPath));
    process.exit(1);
  }
  
  return await fs.readJSON(registryPath) as Registry;
}

export async function list(options: { category?: string; json?: boolean; cwd?: string }) {
  const { category, json, cwd = process.cwd() } = options;

  const registry = await getRegistry();
  const config = await loadConfig(cwd);
  
  let components = category
    ? registry.components.filter(c => c.category === category)
    : registry.components;

  if (json) {
    console.log(JSON.stringify(components, null, 2));
    return;
  }

  console.log(chalk.bold('\n📦 Microbuild Components (Copy & Own)\n'));
  console.log(chalk.dim('Components are copied to your project as source files.\n'));

  // Group by category
  const byCategory = components.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, ComponentEntry[]>);

  // Get category titles
  const categoryTitles = registry.categories.reduce((acc, cat) => {
    acc[cat.name] = cat.title;
    return acc;
  }, {} as Record<string, string>);

  for (const [cat, items] of Object.entries(byCategory)) {
    const catTitle = categoryTitles[cat] || cat.toUpperCase();
    console.log(chalk.bold.cyan(`\n${catTitle}`));
    
    items.forEach(item => {
      const installed = config?.installedComponents.includes(item.name);
      const status = installed ? chalk.green('✓') : ' ';
      const name = item.name.padEnd(28);
      
      console.log(
        `  ${status} ${chalk.green(name)} ${chalk.dim(item.description)}`
      );
      
      // Show what lib modules are required
      if (item.internalDependencies.length > 0) {
        console.log(
          `      ${chalk.dim('requires:')} ${chalk.yellow(item.internalDependencies.join(', '))}`
        );
      }
    });
  }

  // Show categories summary
  console.log(chalk.bold('\n📂 Categories'));
  registry.categories.forEach(cat => {
    const count = registry.components.filter(c => c.category === cat.name).length;
    console.log(`  ${chalk.cyan(cat.name.padEnd(15))} ${count} components - ${chalk.dim(cat.description)}`);
  });

  // Show installed status
  if (config) {
    console.log(chalk.bold('\n📋 Installed'));
    console.log(`  Components: ${chalk.green(config.installedComponents.length)}`);
    console.log(`  Lib modules: ${chalk.green(config.installedLib.length)} ${chalk.dim(`(${config.installedLib.join(', ') || 'none'})`)}`);
  }

  console.log(chalk.bold('\n💡 Usage'));
  console.log(chalk.dim('  npx microbuild add input'));
  console.log(chalk.dim('  npx microbuild add input select-dropdown datetime'));
  console.log(chalk.dim('  npx microbuild add --category selection'));
  console.log(chalk.dim('  npx microbuild add --all\n'));
}
