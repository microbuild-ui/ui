import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';

/**
 * Microbuild Configuration File
 * 
 * Copy & Own Model:
 * - Components are copied to your project as source files
 * - No runtime dependency on @microbuild/* packages
 * - Full customization - you own the code
 * - Works offline after installation
 */
export interface Config {
  $schema?: string;
  /** Distribution model - always 'copy-own' */
  model: 'copy-own';
  /** Use TypeScript (.tsx) or JavaScript (.jsx) */
  tsx: boolean;
  /** Use 'src' directory structure */
  srcDir: boolean;
  /** Path aliases for generated files */
  aliases: {
    /** Where UI components are copied (e.g., @/components/ui) */
    components: string;
    /** Where lib files are copied (e.g., @/lib/microbuild) */
    lib: string;
  };
  /** Installed lib modules */
  installedLib: string[];
  /** Installed components */
  installedComponents: string[];
}

const DEFAULT_CONFIG: Config = {
  $schema: 'https://microbuild.dev/schema.json',
  model: 'copy-own',
  tsx: true,
  srcDir: true,
  aliases: {
    components: '@/components/ui',
    lib: '@/lib/microbuild',
  },
  installedLib: [],
  installedComponents: [],
};

export async function init(options: { yes?: boolean; cwd: string }) {
  const { cwd, yes } = options;

  console.log(chalk.bold('\n🚀 Welcome to Microbuild!\n'));
  console.log(chalk.dim('Copy & Own Model - Components become part of your codebase.\n'));

  // Check if already initialized
  const configPath = path.join(cwd, 'microbuild.json');
  if (fs.existsSync(configPath) && !yes) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'microbuild.json already exists. Overwrite?',
      initial: false,
    });

    if (!overwrite) {
      console.log(chalk.yellow('\n✓ Keeping existing configuration\n'));
      return;
    }
  }

  // Detect project type
  const packageJsonPath = path.join(cwd, 'package.json');
  let projectType = 'unknown';
  let hasSrcDir = fs.existsSync(path.join(cwd, 'src'));

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJSON(packageJsonPath);
    if (packageJson.dependencies?.['next']) {
      projectType = 'next';
      // Next.js App Router often uses 'app' instead of 'src'
      if (fs.existsSync(path.join(cwd, 'app')) && !hasSrcDir) {
        hasSrcDir = false;
      }
    } else if (packageJson.dependencies?.['vite']) {
      projectType = 'vite';
    } else if (packageJson.dependencies?.['react']) {
      projectType = 'react';
    }
  }

  console.log(chalk.dim(`Detected: ${projectType} project${hasSrcDir ? ' with src directory' : ''}\n`));

  let config = { ...DEFAULT_CONFIG };
  config.srcDir = hasSrcDir;

  if (!yes) {
    // Prompt for configuration
    const answers = await prompts([
      {
        type: 'confirm',
        name: 'srcDir',
        message: 'Use src directory?',
        initial: hasSrcDir,
      },
      {
        type: 'text',
        name: 'componentsPath',
        message: 'Where should components be installed?',
        initial: '@/components/ui',
      },
      {
        type: 'text',
        name: 'libPath',
        message: 'Where should lib files (types, services, hooks) be installed?',
        initial: '@/lib/microbuild',
      },
      {
        type: 'confirm',
        name: 'tsx',
        message: 'Use TypeScript?',
        initial: true,
      },
    ]);

    config.srcDir = answers.srcDir ?? hasSrcDir;
    config.aliases.components = answers.componentsPath || '@/components/ui';
    config.aliases.lib = answers.libPath || '@/lib/microbuild';
    config.tsx = answers.tsx ?? true;
  }

  const spinner = ora('Setting up Copy & Own structure...').start();

  try {
    // Write config
    await fs.writeJSON(configPath, config, { spaces: 2 });
    spinner.succeed('Created microbuild.json');

    // Create directory structure
    const baseDir = config.srcDir ? path.join(cwd, 'src') : cwd;
    
    // Components directory
    const componentsDir = resolveAlias(config.aliases.components, cwd, config.srcDir);
    await fs.ensureDir(componentsDir);
    console.log(chalk.green(`✓ Created ${path.relative(cwd, componentsDir)}`));

    // Lib directory structure
    const libDir = resolveAlias(config.aliases.lib, cwd, config.srcDir);
    await fs.ensureDir(libDir);
    await fs.ensureDir(path.join(libDir, 'types'));
    await fs.ensureDir(path.join(libDir, 'services'));
    await fs.ensureDir(path.join(libDir, 'hooks'));
    console.log(chalk.green(`✓ Created ${path.relative(cwd, libDir)}`));
    console.log(chalk.dim('  └── types/'));
    console.log(chalk.dim('  └── services/'));
    console.log(chalk.dim('  └── hooks/'));

    // Check for required dependencies
    console.log(chalk.bold('\n📦 Checking dependencies...\n'));

    // Core dependencies always needed
    const coreDeps = [
      '@mantine/core',
      '@mantine/hooks',
      'react',
      'react-dom',
    ];

    // Optional dependencies for specific features
    const optionalDeps = [
      { name: '@mantine/dates', for: 'DateTime component' },
      { name: '@mantine/notifications', for: 'CollectionForm notifications' },
      { name: '@mantine/dropzone', for: 'Upload component' },
      { name: '@tabler/icons-react', for: 'Icon components' },
      { name: 'dayjs', for: 'DateTime component' },
    ];

    // Utility dependencies (for utils.ts)
    const utilityDeps = ['clsx', 'tailwind-merge'];

    const missingDeps: string[] = [];
    const missingUtilDeps: string[] = [];

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath);
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      for (const dep of coreDeps) {
        if (!allDeps[dep]) {
          missingDeps.push(dep);
        }
      }

      for (const dep of utilityDeps) {
        if (!allDeps[dep]) {
          missingUtilDeps.push(dep);
        }
      }
    }

    if (missingDeps.length > 0) {
      console.log(chalk.yellow('⚠ Missing core dependencies:'));
      missingDeps.forEach(dep => console.log(chalk.dim(`  - ${dep}`)));
      console.log(chalk.dim('\nInstall with:'));
      console.log(chalk.cyan(`  pnpm add ${missingDeps.join(' ')}\n`));
    } else {
      console.log(chalk.green('✓ Core dependencies installed\n'));
    }

    if (missingUtilDeps.length > 0) {
      console.log(chalk.dim('Optional utility dependencies for cn() helper:'));
      console.log(chalk.cyan(`  pnpm add ${missingUtilDeps.join(' ')}\n`));
    }

    // Print benefits
    console.log(chalk.bold.blue('📋 Copy & Own Benefits:\n'));
    console.log('  ✅ No external package dependencies for component code');
    console.log('  ✅ Full customization - components are your application code');
    console.log('  ✅ No breaking changes from upstream updates');
    console.log('  ✅ Bundle only what you use - tree-shaking friendly');
    console.log('  ✅ Works offline after installation');

    // Success message
    console.log(chalk.bold.green('\n✨ Setup complete!\n'));
    console.log('Next steps:');
    console.log(chalk.cyan('  1. Add components: ') + chalk.dim('npx microbuild add input select-dropdown'));
    console.log(chalk.cyan('  2. List components: ') + chalk.dim('npx microbuild list'));
    console.log(chalk.cyan('  3. Add all basics: ') + chalk.dim('npx microbuild add --category input'));
    console.log(chalk.dim('\nComponents will be copied with all dependencies inlined.\n'));

  } catch (error) {
    spinner.fail('Failed to initialize');
    console.error(chalk.red(error));
    process.exit(1);
  }
}

/**
 * Resolve path alias to absolute path
 * Handles @/ aliases and accounts for srcDir configuration
 */
export function resolveAlias(alias: string, cwd: string, srcDir: boolean = true): string {
  if (alias.startsWith('@/')) {
    const relativePath = alias.slice(2);
    if (srcDir) {
      return path.join(cwd, 'src', relativePath);
    }
    return path.join(cwd, relativePath);
  }
  return path.join(cwd, alias);
}

/**
 * Load and validate the microbuild.json config
 */
export async function loadConfig(cwd: string): Promise<Config | null> {
  const configPath = path.join(cwd, 'microbuild.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return await fs.readJSON(configPath) as Config;
}

/**
 * Save the microbuild.json config
 */
export async function saveConfig(cwd: string, config: Config): Promise<void> {
  const configPath = path.join(cwd, 'microbuild.json');
  await fs.writeJSON(configPath, config, { spaces: 2 });
}
