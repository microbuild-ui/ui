/**
 * Microbuild CLI - Add Command
 * 
 * Copy & Own Model:
 * - Copies component source files to your project
 * - Transforms @microbuild/* imports to local paths
 * - Auto-copies required lib modules (types, services, hooks)
 * - No runtime dependency on external packages
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { type Config, loadConfig, saveConfig, resolveAlias } from './init.js';
import { 
  transformImports, 
  toKebabCase, 
  extractMicrobuildDependencies,
  hasMicrobuildImports,
  addOriginHeader
} from './transformer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get packages root (packages/cli/dist/commands -> packages)
const PACKAGES_ROOT = path.resolve(__dirname, '../..');

/**
 * Registry types
 */
interface FileMapping {
  source: string;
  target: string;
}

interface LibModule {
  name: string;
  description: string;
  files?: FileMapping[];
  path?: string;
  target?: string;
  internalDependencies?: string[];
}

interface ComponentEntry {
  name: string;
  title: string;
  description: string;
  category: string;
  files: FileMapping[];
  dependencies: string[];
  internalDependencies: string[];
  registryDependencies?: string[];
}

interface Registry {
  version: string;
  name: string;
  lib: Record<string, LibModule>;
  components: ComponentEntry[];
  categories: Array<{ name: string; title: string; description: string }>;
}

/**
 * Load registry from workspace
 */
async function getRegistry(): Promise<Registry> {
  const registryPath = path.join(PACKAGES_ROOT, 'registry.json');
  
  if (!fs.existsSync(registryPath)) {
    console.error(chalk.red('Registry file not found:', registryPath));
    process.exit(1);
  }
  
  return await fs.readJSON(registryPath);
}

/**
 * Copy and transform a lib module (types, services, or hooks)
 */
async function copyLibModule(
  moduleName: string,
  registry: Registry,
  config: Config,
  cwd: string,
  spinner: ora.Ora
): Promise<boolean> {
  const libModule = registry.lib[moduleName];
  if (!libModule) {
    spinner.warn(`Lib module not found: ${moduleName}`);
    return false;
  }

  // Check if already installed
  if (config.installedLib.includes(moduleName)) {
    return true;
  }

  // First, install dependencies
  if (libModule.internalDependencies) {
    for (const dep of libModule.internalDependencies) {
      if (!config.installedLib.includes(dep)) {
        await copyLibModule(dep, registry, config, cwd, spinner);
      }
    }
  }

  const libDir = resolveAlias(config.aliases.lib, cwd, config.srcDir);

  // Handle single file module (like utils)
  if (libModule.path && libModule.target) {
    const sourcePath = path.join(PACKAGES_ROOT, libModule.path);
    const targetPath = path.join(
      config.srcDir ? path.join(cwd, 'src') : cwd,
      libModule.target
    );

    if (fs.existsSync(sourcePath)) {
      let content = await fs.readFile(sourcePath, 'utf-8');
      content = transformImports(content, config);
      content = addOriginHeader(content, moduleName, '@microbuild/lib', registry.version);
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, content);
    }
  }

  // Handle multi-file module
  if (libModule.files) {
    for (const file of libModule.files) {
      const sourcePath = path.join(PACKAGES_ROOT, file.source);
      const targetPath = path.join(
        config.srcDir ? path.join(cwd, 'src') : cwd,
        file.target
      );

      if (fs.existsSync(sourcePath)) {
        let content = await fs.readFile(sourcePath, 'utf-8');
        content = transformImports(content, config);
        // Extract filename for origin tracking
        const fileName = path.basename(file.source, path.extname(file.source));
        content = addOriginHeader(content, `${moduleName}/${fileName}`, '@microbuild/lib', registry.version);
        await fs.ensureDir(path.dirname(targetPath));
        await fs.writeFile(targetPath, content);
      } else {
        spinner.warn(`Source file not found: ${file.source}`);
      }
    }
  }

  config.installedLib.push(moduleName);
  spinner.succeed(`Installed lib: ${moduleName}`);
  return true;
}

/**
 * Copy and transform a component
 */
async function copyComponent(
  component: ComponentEntry,
  registry: Registry,
  config: Config,
  cwd: string,
  overwrite: boolean,
  spinner: ora.Ora
): Promise<boolean> {
  // Check if already installed
  if (config.installedComponents.includes(component.name) && !overwrite) {
    const { shouldOverwrite } = await prompts({
      type: 'confirm',
      name: 'shouldOverwrite',
      message: `${component.title} already installed. Overwrite?`,
      initial: false,
    });

    if (!shouldOverwrite) {
      spinner.info(`Skipped ${component.title}`);
      return false;
    }
  }

  // Install internal dependencies first (types, services, hooks)
  for (const dep of component.internalDependencies) {
    if (!config.installedLib.includes(dep)) {
      spinner.text = `Installing dependency: ${dep}...`;
      await copyLibModule(dep, registry, config, cwd, spinner);
    }
  }

  // Install registry dependencies (other components)
  if (component.registryDependencies) {
    for (const depName of component.registryDependencies) {
      if (!config.installedComponents.includes(depName)) {
        const depComponent = registry.components.find(c => c.name === depName);
        if (depComponent) {
          spinner.text = `Installing component dependency: ${depComponent.title}...`;
          await copyComponent(depComponent, registry, config, cwd, overwrite, spinner);
        }
      }
    }
  }

  // Copy component files
  const componentsDir = resolveAlias(config.aliases.components, cwd, config.srcDir);

  for (const file of component.files) {
    const sourcePath = path.join(PACKAGES_ROOT, file.source);
    const targetPath = path.join(
      config.srcDir ? path.join(cwd, 'src') : cwd,
      file.target
    );

    if (!fs.existsSync(sourcePath)) {
      spinner.warn(`Source not found: ${file.source}`);
      continue;
    }

    // Read and transform
    let content = await fs.readFile(sourcePath, 'utf-8');
    content = transformImports(content, config);
    
    // Add origin header for maintainability
    content = addOriginHeader(content, component.name, '@microbuild/ui-interfaces', registry.version);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(targetPath));
    
    // Write transformed file
    const ext = config.tsx ? '.tsx' : '.jsx';
    const finalPath = targetPath.replace(/\.tsx?$/, ext);
    await fs.writeFile(finalPath, content);
  }

  // Track installation
  if (!config.installedComponents.includes(component.name)) {
    config.installedComponents.push(component.name);
  }

  spinner.succeed(`Added ${component.title}`);
  return true;
}

/**
 * Main add command
 */
export async function add(
  components: string[],
  options: {
    all?: boolean;
    category?: string;
    overwrite?: boolean;
    cwd: string;
  }
) {
  const { cwd, all, category, overwrite = false } = options;

  // Load config
  const config = await loadConfig(cwd);
  if (!config) {
    console.log(chalk.red('\n✗ microbuild.json not found. Run "npx microbuild init" first.\n'));
    process.exit(1);
  }

  const registry = await getRegistry();

  // Determine which components to add
  let componentsToAdd: ComponentEntry[] = [];

  if (all) {
    componentsToAdd = registry.components;
  } else if (category) {
    componentsToAdd = registry.components.filter(c => c.category === category);
    if (componentsToAdd.length === 0) {
      console.log(chalk.red(`\n✗ No components found in category: ${category}\n`));
      const categories = registry.categories.map(c => c.name).join(', ');
      console.log(chalk.dim(`Available categories: ${categories}\n`));
      process.exit(1);
    }
  } else if (components.length > 0) {
    for (const name of components) {
      const component = registry.components.find(
        c => c.name.toLowerCase() === name.toLowerCase() ||
            c.title.toLowerCase() === name.toLowerCase()
      );
      if (!component) {
        console.log(chalk.red(`\n✗ Component not found: ${name}\n`));
        console.log(chalk.dim('Run "npx microbuild list" to see available components.\n'));
        process.exit(1);
      }
      componentsToAdd.push(component);
    }
  } else {
    // Interactive selection
    const choices = registry.categories.map(cat => ({
      title: chalk.bold(cat.title),
      value: cat.name,
      description: cat.description,
    }));

    const { selectedCategory } = await prompts({
      type: 'select',
      name: 'selectedCategory',
      message: 'Select a category',
      choices,
    });

    if (!selectedCategory) {
      console.log(chalk.yellow('\n✓ No category selected\n'));
      return;
    }

    const categoryComponents = registry.components.filter(
      c => c.category === selectedCategory
    );

    const { selected } = await prompts({
      type: 'multiselect',
      name: 'selected',
      message: 'Select components to add',
      choices: categoryComponents.map(c => ({
        title: `${c.title} - ${c.description}`,
        value: c.name,
        selected: false,
      })),
      hint: '- Space to select. Return to submit',
    });

    componentsToAdd = registry.components.filter(c => selected?.includes(c.name));
  }

  if (componentsToAdd.length === 0) {
    console.log(chalk.yellow('\n✓ No components selected\n'));
    return;
  }

  console.log(chalk.bold(`\n📦 Adding ${componentsToAdd.length} component(s)...\n`));

  const spinner = ora('Processing...').start();
  const allDeps = new Set<string>();

  try {
    for (const component of componentsToAdd) {
      spinner.text = `Adding ${component.title}...`;
      await copyComponent(component, registry, config, cwd, overwrite, spinner);
      
      // Collect external dependencies
      component.dependencies.forEach(dep => allDeps.add(dep));
    }

    // Save updated config
    await saveConfig(cwd, config);

    spinner.succeed('All components added!');

    // Check for missing external dependencies
    console.log(chalk.bold('\n📦 External dependencies...\n'));

    const packageJsonPath = path.join(cwd, 'package.json');
    let missingDeps: string[] = [];

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath);
      const installed = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      missingDeps = Array.from(allDeps).filter(dep => !installed[dep]);
    } else {
      missingDeps = Array.from(allDeps);
    }

    if (missingDeps.length > 0) {
      console.log(chalk.yellow('⚠ Missing dependencies:'));
      missingDeps.forEach(dep => console.log(chalk.dim(`  - ${dep}`)));
      console.log(chalk.dim('\nInstall with:'));
      console.log(chalk.cyan(`  pnpm add ${missingDeps.join(' ')}\n`));
    } else {
      console.log(chalk.green('✓ All external dependencies installed\n'));
    }

    // Summary
    console.log(chalk.bold.blue('📋 Summary:\n'));
    console.log(chalk.dim('Components installed:'));
    config.installedComponents.forEach(name => {
      console.log(chalk.green(`  ✓ ${name}`));
    });
    
    if (config.installedLib.length > 0) {
      console.log(chalk.dim('\nLib modules installed:'));
      config.installedLib.forEach(name => {
        console.log(chalk.green(`  ✓ ${name}`));
      });
    }

    console.log(chalk.bold.green('\n✨ Done!\n'));
    console.log(chalk.dim('Components are now part of your codebase. Customize freely!'));
    console.log(chalk.dim(`Location: ${config.aliases.components}\n`));

  } catch (error) {
    spinner.fail('Failed to add components');
    console.error(chalk.red(error));
    process.exit(1);
  }
}
