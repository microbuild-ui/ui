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
import ora, { type Ora } from 'ora';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { type Config, loadConfig, saveConfig } from './init.js';
import { 
  transformImports, 
  transformRelativeImports,
  transformVFormImports,
  addOriginHeader
} from './transformer.js';
import { validate } from './validate.js';

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
 * Common component aliases for better discovery
 */
const COMPONENT_ALIASES: Record<string, string> = {
  'form': 'vform',
  'dynamicform': 'vform',
  'v-form': 'vform',
  'select': 'select-dropdown',
  'dropdown': 'select-dropdown',
  'checkbox': 'boolean',
  'switch': 'toggle',
  'date': 'datetime',
  'time': 'datetime',
  'datepicker': 'datetime',
  'text': 'input',
  'textinput': 'input',
  'textfield': 'input',
  'image': 'file-image',
  'imageupload': 'file-image',
  'wysiwyg': 'rich-text-html',
  'richtext': 'rich-text-html',
  'markdown': 'rich-text-markdown',
  'md': 'rich-text-markdown',
  'm2m': 'list-m2m',
  'm2o': 'list-m2o',
  'o2m': 'list-o2m',
  'm2a': 'list-m2a',
  'manytomany': 'list-m2m',
  'manytoone': 'list-m2o',
  'onetomany': 'list-o2m',
  'manytoany': 'list-m2a',
  'relation': 'list-m2o',
  'multiselect': 'select-multiple-dropdown',
  'checkboxes': 'select-multiple-checkbox',
  'radio': 'select-radio',
  'icon': 'select-icon',
  'colorpicker': 'color',
  'fileupload': 'file',
  'code': 'input-code',
  'blockeditor': 'input-block-editor',
  'editor': 'input-block-editor',
};

/**
 * Find component with smart matching and suggestions
 */
function findComponentWithSuggestions(name: string, registry: Registry): ComponentEntry | null {
  const normalized = name.toLowerCase().replace(/-/g, '');
  
  // Direct match by name
  const directMatch = registry.components.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );
  if (directMatch) return directMatch;
  
  // Match by title
  const titleMatch = registry.components.find(
    c => c.title.toLowerCase() === name.toLowerCase()
  );
  if (titleMatch) return titleMatch;
  
  // Fuzzy match (remove dashes)
  const fuzzyMatch = registry.components.find(
    c => c.name.toLowerCase().replace(/-/g, '') === normalized ||
         c.title.toLowerCase().replace(/-/g, '') === normalized
  );
  if (fuzzyMatch) return fuzzyMatch;
  
  // Check aliases
  const aliasedName = COMPONENT_ALIASES[normalized];
  if (aliasedName) {
    const aliasMatch = registry.components.find(c => c.name === aliasedName);
    if (aliasMatch) {
      console.log(chalk.yellow(`\n💡 "${name}" matched alias → using "${aliasMatch.name}"\n`));
      return aliasMatch;
    }
  }
  
  // No match found - provide helpful suggestions
  console.log(chalk.red(`\n✗ Component not found: ${name}\n`));
  
  // Find similar components
  const suggestions = registry.components
    .map(c => ({
      component: c,
      score: calculateSimilarity(normalized, c.name.replace(/-/g, '')) +
             calculateSimilarity(normalized, c.title.toLowerCase().replace(/-/g, '')) +
             (c.description.toLowerCase().includes(name.toLowerCase()) ? 0.3 : 0)
    }))
    .filter(s => s.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  if (suggestions.length > 0) {
    console.log(chalk.yellow('Did you mean one of these?\n'));
    suggestions.forEach(s => {
      console.log(`  ${chalk.green(s.component.name.padEnd(28))} ${chalk.dim(s.component.description)}`);
    });
    console.log();
  }
  
  // Show category hint
  const categoryHint = registry.categories.find(cat => 
    name.toLowerCase().includes(cat.name.toLowerCase())
  );
  if (categoryHint) {
    console.log(chalk.dim(`Try: microbuild add --category ${categoryHint.name}\n`));
  }
  
  console.log(chalk.dim('Commands to help you find components:'));
  console.log(chalk.dim('  microbuild list              List all components'));
  console.log(chalk.dim('  microbuild list --category   Filter by category'));
  console.log(chalk.dim('  microbuild info <name>       Get component details\n'));
  
  return null;
}

/**
 * Simple similarity score (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.7;
  
  // Count matching characters
  let matches = 0;
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return matches / longer.length;
}

/**
 * Copy and transform a lib module (types, services, or hooks)
 */
async function copyLibModule(
  moduleName: string,
  registry: Registry,
  config: Config,
  cwd: string,
  spinner: Ora
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
 * Dry run info for component preview
 */
interface DryRunInfo {
  component: string;
  files: { source: string; target: string }[];
  dependencies: string[];
  libDependencies: string[];
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
  spinner: Ora,
  installing = new Set<string>(),  // Track components being installed to prevent circular deps
  dryRun = false,  // Preview mode - don't write files
  dryRunInfo?: DryRunInfo[]  // Collect dry run info
): Promise<boolean> {
  // Check for circular dependency
  if (installing.has(component.name)) {
    return true; // Already being installed in this call stack
  }
  
  // Check if already installed
  if (config.installedComponents.includes(component.name) && !overwrite && !dryRun) {
    // In non-interactive/batch mode (--all, bootstrap), silently skip already-installed components
    if (installing.has('__nonInteractive__')) {
      return true;
    }
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

  // Mark as being installed to prevent circular deps
  installing.add(component.name);

  // Collect dry run info
  const info: DryRunInfo = {
    component: component.name,
    files: component.files.map(f => ({ source: f.source, target: f.target })),
    dependencies: component.dependencies,
    libDependencies: component.internalDependencies,
  };

  // Install internal dependencies first (types, services, hooks)
  for (const dep of component.internalDependencies) {
    if (!config.installedLib.includes(dep)) {
      spinner.text = `Installing dependency: ${dep}...`;
      if (!dryRun) {
        await copyLibModule(dep, registry, config, cwd, spinner);
      }
    }
  }

  // Install registry dependencies (other components)
  if (component.registryDependencies) {
    for (const depName of component.registryDependencies) {
      if (!config.installedComponents.includes(depName) && !installing.has(depName)) {
        const depComponent = registry.components.find(c => c.name === depName);
        if (depComponent) {
          spinner.text = `Installing component dependency: ${depComponent.title}...`;
          await copyComponent(depComponent, registry, config, cwd, overwrite, spinner, installing, dryRun, dryRunInfo);
        }
      }
    }
  }

  // In dry run mode, just collect info and return
  if (dryRun) {
    if (dryRunInfo) {
      dryRunInfo.push(info);
    }
    spinner.info(`Would add ${component.title}`);
    return true;
  }

  // Copy component files
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
    content = transformImports(content, config, file.target);
    
    // Transform relative imports for flattened folder structure
    content = transformRelativeImports(content, file.source, file.target, config.aliases.components);
    
    // Apply VForm-specific transformations for files in vform folder
    if (component.name === 'vform' || file.target.includes('/vform/')) {
      content = transformVFormImports(content, file.source, file.target);
    }
    
    // Add origin header for maintainability
    content = addOriginHeader(content, component.name, '@microbuild/ui-interfaces', registry.version);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(targetPath));
    
    // Write transformed file
    const ext = config.tsx ? '.tsx' : '.jsx';
    const finalPath = targetPath.replace(/\.tsx?$/, ext);
    await fs.writeFile(finalPath, content);
  }

  // Track installation with version info
  if (!config.installedComponents.includes(component.name)) {
    config.installedComponents.push(component.name);
  }
  
  // Track component version
  if (!config.componentVersions) {
    config.componentVersions = {};
  }
  config.componentVersions[component.name] = {
    version: registry.version,
    installedAt: new Date().toISOString(),
    source: '@microbuild/ui-interfaces',
  };

  spinner.succeed(`Added ${component.title}`);
  return true;
}

/**
 * Generate components/ui/index.ts with exports for all installed components
 * This allows import { ComponentA, ComponentB } from '@/components/ui'
 * 
 * Also detects duplicate named exports across files and warns the user.
 */
async function generateComponentsIndex(
  config: Config,
  cwd: string,
  registry: Registry,
  spinner: Ora
): Promise<void> {
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const componentsDir = path.join(srcDir, 'components/ui');
  const indexPath = path.join(componentsDir, 'index.ts');
  
  spinner.text = 'Generating components/ui/index.ts...';
  
  // Build export lines for each installed component
  const exportLines: string[] = [
    '/**',
    ' * Microbuild UI Components Index',
    ' * ',
    ' * Auto-generated by Microbuild CLI.',
    ' * Re-run "microbuild add" to update after adding new components.',
    ' */',
    '',
  ];
  
  // Use Set to track unique export paths and prevent duplicates
  const exportedPaths = new Set<string>();
  
  // Track named exports across files to detect duplicates
  const namedExportMap = new Map<string, string[]>(); // exportName -> [files]
  
  // Sort components alphabetically for consistent output
  const sortedComponents = [...config.installedComponents].sort();
  
  // Components with known SSR issues that should use wrappers
  const ssrUnsafeComponents: Record<string, string> = {
    'input-block-editor': 'input-block-editor-wrapper',
  };
  
  // Track skipped components due to SSR wrappers
  const skippedForWrapper: string[] = [];
  
  for (const componentName of sortedComponents) {
    const component = registry.components.find(c => c.name === componentName);
    if (!component) continue;
    
    // Determine the export path based on component structure
    const mainFile = component.files[0];
    if (!mainFile) continue;
    
    const targetPath = mainFile.target;
    let exportPath: string;
    
    // Check if component is in a subfolder (e.g., vform/VForm.tsx) or flat (e.g., input.tsx)
    if (targetPath.includes('/vform/')) {
      // VForm is in a subfolder - export from index
      exportPath = './vform';
    } else {
      // Flat structure - export from kebab-case file
      const fileName = path.basename(targetPath, path.extname(targetPath));
      
      // Check for SSR wrapper replacements
      if (ssrUnsafeComponents[fileName]) {
        const wrapperPath = path.join(componentsDir, `${ssrUnsafeComponents[fileName]}.tsx`);
        if (fs.existsSync(wrapperPath)) {
          exportPath = `./${ssrUnsafeComponents[fileName]}`;
          skippedForWrapper.push(fileName);
        } else {
          exportPath = `./${fileName}`;
        }
      } else {
        exportPath = `./${fileName}`;
      }
    }
    
    // Only add if not already exported (prevents duplicates)
    if (!exportedPaths.has(exportPath)) {
      exportedPaths.add(exportPath);
      exportLines.push(`export * from '${exportPath}';`);
      
      // Check for named exports in the file
      const filePath = path.join(componentsDir, exportPath.slice(2) + '.tsx');
      if (fs.existsSync(filePath)) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const namedExportPattern = /export\s+(?:const|function|class)\s+(\w+)/g;
          let match;
          while ((match = namedExportPattern.exec(content)) !== null) {
            const exportName = match[1];
            if (!namedExportMap.has(exportName)) {
              namedExportMap.set(exportName, []);
            }
            namedExportMap.get(exportName)!.push(exportPath);
          }
        } catch {
          // Ignore read errors
        }
      }
    }
  }
  
  // Write the index file
  await fs.writeFile(indexPath, exportLines.join('\n') + '\n');
  
  // Warn about duplicate named exports
  const duplicates = Array.from(namedExportMap.entries())
    .filter(([_, files]) => files.length > 1);
  
  if (duplicates.length > 0) {
    spinner.warn('Generated components/ui/index.ts (with duplicate warnings)');
    console.log(chalk.yellow('\n⚠ Duplicate export names detected:'));
    for (const [exportName, files] of duplicates) {
      console.log(chalk.dim(`  "${exportName}" exported from: ${files.join(', ')}`));
    }
    console.log(chalk.dim('  Consider using named imports or renaming exports.\n'));
  } else {
    spinner.info('Generated components/ui/index.ts');
  }
  
  if (skippedForWrapper.length > 0) {
    console.log(chalk.dim(`  ℹ Using SSR-safe wrappers for: ${skippedForWrapper.join(', ')}`));
  }
}

/**
 * Main add command
 */
export async function add(
  components: string[],
  options: {
    all?: boolean;
    withApi?: boolean;
    category?: string;
    overwrite?: boolean;
    dryRun?: boolean;
    nonInteractive?: boolean;
    cwd: string;
  }
) {
  const { cwd, all, withApi, category, overwrite = false, dryRun = false, nonInteractive = false } = options;

  // Dry run mode header
  if (dryRun) {
    console.log(chalk.yellow('\n🔍 Dry Run Mode - No files will be modified\n'));
  }

  // Load config
  const config = await loadConfig(cwd);
  if (!config) {
    console.log(chalk.red('\n✗ microbuild.json not found. Run "npx microbuild init" first.\n'));
    process.exit(1);
  }

  // Initialize componentVersions if not present
  if (!config.componentVersions) {
    config.componentVersions = {};
  }

  const registry = await getRegistry();

  // If --with-api flag is set, add api-routes and supabase-auth lib modules
  if (withApi || all) {
    console.log(chalk.bold('\n🔌 Installing API routes and Supabase auth...\n'));
    const spinner = ora('Processing lib modules...').start();
    
    // Install supabase-auth first (dependency of api-routes)
    if (registry.lib['supabase-auth'] && !config.installedLib.includes('supabase-auth')) {
      await copyLibModule('supabase-auth', registry, config, cwd, spinner);
    }
    
    // Install api-routes
    if (registry.lib['api-routes'] && !config.installedLib.includes('api-routes')) {
      await copyLibModule('api-routes', registry, config, cwd, spinner);
    }
    
    spinner.succeed('API routes and auth installed!');
    await saveConfig(cwd, config);
  }

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
      const component = findComponentWithSuggestions(name, registry);
      if (!component) {
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

  // Dry run mode - show what would be installed
  if (dryRun) {
    console.log(chalk.bold(`\n🔍 Dry Run: Would add ${componentsToAdd.length} component(s)\n`));
    
    const dryRunInfo: DryRunInfo[] = [];
    const spinner = ora('Analyzing...').start();
    
    for (const component of componentsToAdd) {
      spinner.text = `Analyzing ${component.title}...`;
      await copyComponent(component, registry, config, cwd, overwrite, spinner, new Set(), true, dryRunInfo);
    }
    
    spinner.stop();
    
    // Display dry run summary
    console.log(chalk.bold('\n📋 Files that would be created:\n'));
    
    for (const info of dryRunInfo) {
      console.log(chalk.cyan(`  ${info.component}:`));
      for (const file of info.files) {
        console.log(chalk.dim(`    → ${file.target}`));
      }
    }
    
    // Show dependencies
    const allDryRunDeps = new Set<string>();
    dryRunInfo.forEach(info => info.dependencies.forEach(dep => allDryRunDeps.add(dep)));
    
    if (allDryRunDeps.size > 0) {
      console.log(chalk.bold('\n📦 External dependencies needed:\n'));
      Array.from(allDryRunDeps).forEach(dep => console.log(chalk.dim(`    ${dep}`)));
    }
    
    console.log(chalk.dim('\n  Run without --dry-run to install components.\n'));
    return;
  }

  console.log(chalk.bold(`\n📦 Adding ${componentsToAdd.length} component(s)...\n`));

  const spinner = ora('Processing...').start();
  const allDeps = new Set<string>();

  try {
    // Share a single installing Set across all components to prevent duplicate processing
    const sharedInstalling = new Set<string>();
    // Signal non-interactive mode so already-installed components are silently skipped
    if (nonInteractive || all) {
      sharedInstalling.add('__nonInteractive__');
    }

    for (const component of componentsToAdd) {
      spinner.text = `Adding ${component.title}...`;
      await copyComponent(component, registry, config, cwd, overwrite, spinner, sharedInstalling, false);
      
      // Collect external dependencies
      component.dependencies.forEach(dep => allDeps.add(dep));
    }

    // Update registry version
    config.registryVersion = registry.version;

    // Save updated config
    await saveConfig(cwd, config);

    // Generate components/ui/index.ts with all exports
    await generateComponentsIndex(config, cwd, registry, spinner);

    spinner.succeed('All components added!');

    // Run post-install validation to catch any issues (skip in non-interactive mode — bootstrap runs its own)
    if (!nonInteractive) {
      console.log(chalk.bold('\n🔍 Running post-install validation...\n'));
      try {
        await validate({ cwd, json: false });
      } catch {
        // Validation errors are already printed, continue with summary
      }
    }

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
      
      // In non-interactive mode (bootstrap), auto-install without prompting
      let autoInstall = nonInteractive;
      if (!nonInteractive) {
        const answer = await prompts({
          type: 'confirm',
          name: 'autoInstall',
          message: 'Install missing dependencies automatically?',
          initial: true,
        });
        autoInstall = answer.autoInstall;
      }
      
      if (autoInstall) {
        const installSpinner = ora('Installing dependencies...').start();
        try {
          // Detect package manager
          const hasYarnLock = fs.existsSync(path.join(cwd, 'yarn.lock'));
          const hasPnpmLock = fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'));
          const hasBunLock = fs.existsSync(path.join(cwd, 'bun.lockb'));
          
          let installCmd: string;
          if (hasPnpmLock) {
            installCmd = `pnpm add ${missingDeps.join(' ')}`;
          } else if (hasYarnLock) {
            installCmd = `yarn add ${missingDeps.join(' ')}`;
          } else if (hasBunLock) {
            installCmd = `bun add ${missingDeps.join(' ')}`;
          } else {
            installCmd = `npm install ${missingDeps.join(' ')}`;
          }
          
          const { execSync } = await import('child_process');
          execSync(installCmd, { cwd, stdio: 'pipe' });
          installSpinner.succeed('Dependencies installed!');
        } catch (error) {
          installSpinner.fail('Failed to install dependencies');
          console.log(chalk.dim('\nInstall manually with:'));
          console.log(chalk.cyan(`  pnpm add ${missingDeps.join(' ')}\n`));
        }
      } else {
        console.log(chalk.dim('\nInstall manually with:'));
        console.log(chalk.cyan(`  pnpm add ${missingDeps.join(' ')}\n`));
      }
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
