import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { Config } from './init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get workspace root (3 levels up from cli/dist when bundled)
const WORKSPACE_ROOT = path.join(__dirname, '../../..');

interface ComponentMetadata {
  name: string;
  package: string;
  category: string;
  description: string;
  path: string;
  dependencies?: string[];
  peerDependencies?: string[];
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

export async function add(
  components: string[],
  options: {
    all?: boolean;
    category?: string;
    overwrite?: boolean;
    cwd: string;
  }
) {
  const { cwd, all, category, overwrite } = options;

  // Load config
  const configPath = path.join(cwd, 'microbuild.json');
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('\n✗ microbuild.json not found. Run "microbuild init" first.\n'));
    process.exit(1);
  }

  const config: Config = await fs.readJSON(configPath);
  const registry = await getRegistry();

  // Determine which components to add
  let componentsToAdd: ComponentMetadata[] = [];

  if (all) {
    componentsToAdd = registry;
  } else if (category) {
    componentsToAdd = registry.filter(c => c.category === category);
    if (componentsToAdd.length === 0) {
      console.log(chalk.red(`\n✗ No components found in category: ${category}\n`));
      process.exit(1);
    }
  } else if (components.length > 0) {
    for (const name of components) {
      const component = registry.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!component) {
        console.log(chalk.red(`\n✗ Component not found: ${name}\n`));
        console.log(chalk.dim('Run "microbuild list" to see available components.\n'));
        process.exit(1);
      }
      componentsToAdd.push(component);
    }
  } else {
    // Interactive selection
    const { selected } = await prompts({
      type: 'multiselect',
      name: 'selected',
      message: 'Select components to add',
      choices: registry.map(c => ({
        title: `${c.name} - ${c.description}`,
        value: c.name,
      })),
    });

    componentsToAdd = registry.filter(c => selected.includes(c.name));
  }

  if (componentsToAdd.length === 0) {
    console.log(chalk.yellow('\n✓ No components selected\n'));
    return;
  }

  console.log(chalk.bold(`\n📦 Adding ${componentsToAdd.length} component(s)...\n`));

  const componentsDir = resolveAlias(config.aliases.components, cwd);
  const uiDir = path.join(componentsDir, 'ui');

  for (const component of componentsToAdd) {
    const spinner = ora(`Adding ${component.name}...`).start();

    try {
      const targetDir = path.join(uiDir, component.name.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1));
      const targetFile = path.join(targetDir, config.tsx ? 'index.tsx' : 'index.jsx');

      // Check if exists
      if (fs.existsSync(targetFile) && !overwrite) {
        const { shouldOverwrite } = await prompts({
          type: 'confirm',
          name: 'shouldOverwrite',
          message: `${component.name} already exists. Overwrite?`,
          initial: false,
        });

        if (!shouldOverwrite) {
          spinner.info(`Skipped ${component.name}`);
          continue;
        }
      }

      // Copy component
      const sourcePath = path.join(WORKSPACE_ROOT, component.path);
      const sourceFile = path.join(sourcePath, 'index.tsx');

      if (!fs.existsSync(sourceFile)) {
        spinner.fail(`Source not found: ${component.name}`);
        continue;
      }

      await fs.ensureDir(targetDir);
      await fs.copy(sourceFile, targetFile);

      // Copy any additional files (stories, tests, etc.)
      const sourceFiles = await fs.readdir(sourcePath);
      for (const file of sourceFiles) {
        if (file !== 'index.tsx' && file !== 'index.ts') {
          const src = path.join(sourcePath, file);
          const dest = path.join(targetDir, file);
          if ((await fs.stat(src)).isFile()) {
            await fs.copy(src, dest);
          }
        }
      }

      spinner.succeed(`Added ${component.name}`);
    } catch (error) {
      spinner.fail(`Failed to add ${component.name}`);
      console.error(chalk.red(error));
    }
  }

  // Check for missing dependencies
  console.log(chalk.bold('\n📦 Checking dependencies...\n'));

  const allDeps = new Set<string>();
  const allPeerDeps = new Set<string>();

  for (const component of componentsToAdd) {
    component.dependencies?.forEach(dep => allDeps.add(dep));
    component.peerDependencies?.forEach(dep => allPeerDeps.add(dep));
  }

  const packageJsonPath = path.join(cwd, 'package.json');
  let missingDeps: string[] = [];
  let missingPeerDeps: string[] = [];

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJSON(packageJsonPath);
    const installed = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    missingDeps = Array.from(allDeps).filter(dep => !installed[dep]);
    missingPeerDeps = Array.from(allPeerDeps).filter(dep => !installed[dep]);
  }

  if (missingDeps.length > 0) {
    console.log(chalk.yellow('⚠ Missing dependencies:'));
    missingDeps.forEach(dep => console.log(chalk.dim(`  - ${dep}`)));
    console.log(chalk.dim('\nInstall with:'));
    console.log(chalk.cyan(`  pnpm add ${missingDeps.join(' ')}\n`));
  }

  if (missingPeerDeps.length > 0) {
    console.log(chalk.yellow('⚠ Missing peer dependencies:'));
    missingPeerDeps.forEach(dep => console.log(chalk.dim(`  - ${dep}`)));
    console.log(chalk.dim('\nInstall with:'));
    console.log(chalk.cyan(`  pnpm add ${missingPeerDeps.join(' ')}\n`));
  }

  if (missingDeps.length === 0 && missingPeerDeps.length === 0) {
    console.log(chalk.green('✓ All dependencies installed\n'));
  }

  console.log(chalk.bold.green('✨ Done!\n'));
}

/**
 * Resolve path alias to absolute path
 */
function resolveAlias(alias: string, cwd: string): string {
  if (alias.startsWith('@/')) {
    return path.join(cwd, 'src', alias.slice(2));
  }
  return path.join(cwd, alias);
}
