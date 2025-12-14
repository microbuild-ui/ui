import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';

export interface Config {
  $schema?: string;
  style: string;
  tsx: boolean;
  aliases: {
    components: string;
    utils: string;
    types: string;
    services: string;
    hooks: string;
  };
}

const DEFAULT_CONFIG: Config = {
  $schema: 'https://microbuild.dev/schema.json',
  style: 'default',
  tsx: true,
  aliases: {
    components: '@/components',
    utils: '@/lib/utils',
    types: '@microbuild/types',
    services: '@microbuild/services',
    hooks: '@microbuild/hooks',
  },
};

export async function init(options: { yes?: boolean; cwd: string }) {
  const { cwd, yes } = options;

  console.log(chalk.bold('\n🚀 Welcome to Microbuild!\n'));

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

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJSON(packageJsonPath);
    if (packageJson.dependencies?.['next']) {
      projectType = 'next';
    } else if (packageJson.dependencies?.['vite']) {
      projectType = 'vite';
    } else if (packageJson.dependencies?.['react']) {
      projectType = 'react';
    }
  }

  console.log(chalk.dim(`Detected project: ${projectType}\n`));

  let config = { ...DEFAULT_CONFIG };

  if (!yes) {
    // Prompt for configuration
    const answers = await prompts([
      {
        type: 'text',
        name: 'componentsPath',
        message: 'Where should components be installed?',
        initial: '@/components',
      },
      {
        type: 'confirm',
        name: 'tsx',
        message: 'Use TypeScript?',
        initial: true,
      },
    ]);

    config.aliases.components = answers.componentsPath || '@/components';
    config.tsx = answers.tsx ?? true;
  }

  const spinner = ora('Creating configuration...').start();

  try {
    // Write config
    await fs.writeJSON(configPath, config, { spaces: 2 });
    spinner.succeed('Created microbuild.json');

    // Create components directory
    const componentsDir = resolveAlias(config.aliases.components, cwd);
    const uiDir = path.join(componentsDir, 'ui');
    
    await fs.ensureDir(uiDir);
    console.log(chalk.green(`✓ Created ${path.relative(cwd, uiDir)}`));

    // Check for required dependencies
    console.log(chalk.bold('\n📦 Checking dependencies...\n'));

    const requiredDeps = [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates',
      '@mantine/notifications',
      '@tabler/icons-react',
      'react',
      'react-dom',
    ];

    const missingDeps: string[] = [];

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath);
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      for (const dep of requiredDeps) {
        if (!allDeps[dep]) {
          missingDeps.push(dep);
        }
      }
    }

    if (missingDeps.length > 0) {
      console.log(chalk.yellow('⚠ Missing peer dependencies:'));
      missingDeps.forEach(dep => console.log(chalk.dim(`  - ${dep}`)));
      console.log(chalk.dim('\nInstall them with:'));
      console.log(chalk.cyan(`  pnpm add ${missingDeps.join(' ')}\n`));
    } else {
      console.log(chalk.green('✓ All peer dependencies installed\n'));
    }

    // Success message
    console.log(chalk.bold.green('✨ Setup complete!\n'));
    console.log('Next steps:');
    console.log(chalk.cyan('  1. Add components: ') + chalk.dim('microbuild add input'));
    console.log(chalk.cyan('  2. List components: ') + chalk.dim('microbuild list'));
    console.log(chalk.cyan('  3. View docs: ') + chalk.dim('https://microbuild.dev\n'));

  } catch (error) {
    spinner.fail('Failed to initialize');
    console.error(chalk.red(error));
    process.exit(1);
  }
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
