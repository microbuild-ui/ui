import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get workspace root (3 levels up from cli/dist when bundled)
const WORKSPACE_ROOT = path.join(__dirname, '../../..');

interface ComponentMetadata {
  name: string;
  package: string;
  category: string;
  description: string;
}

// Load registry from shared JSON file
async function getRegistry(): Promise<ComponentMetadata[]> {
  const registryPath = path.join(WORKSPACE_ROOT, 'packages/registry.json');
  
  if (!fs.existsSync(registryPath)) {
    console.error(chalk.red('Registry file not found:', registryPath));
    process.exit(1);
  }
  
  const registry = await fs.readJSON(registryPath);
  return registry.components as ComponentMetadata[];
}

export async function list(options: { category?: string; json?: boolean }) {
  const { category, json } = options;

  const registry = await getRegistry();
  let components = category
    ? registry.filter(c => c.category === category)
    : registry;

  if (json) {
    console.log(JSON.stringify(components, null, 2));
    return;
  }

  console.log(chalk.bold('\n📦 Available Microbuild Components\n'));

  // Group by category
  const byCategory = components.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, ComponentMetadata[]>);

  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(chalk.bold.cyan(`\n${cat.toUpperCase()}`));
    items.forEach(item => {
      console.log(
        `  ${chalk.green(item.name.padEnd(25))} ${chalk.dim(item.description)}`
      );
    });
  }

  console.log(chalk.bold('\n💡 Usage'));
  console.log(chalk.dim('  microbuild add input'));
  console.log(chalk.dim('  microbuild add input select-dropdown datetime'));
  console.log(chalk.dim('  microbuild add --category selection\n'));
}
