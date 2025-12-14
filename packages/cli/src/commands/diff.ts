import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function diff(component: string, options: { cwd: string }) {
  const { cwd } = options;

  console.log(chalk.bold(`\n📋 Preview: ${component}\n`));

  // Load config
  const configPath = path.join(cwd, 'microbuild.json');
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('✗ microbuild.json not found. Run "microbuild init" first.\n'));
    process.exit(1);
  }

  console.log(chalk.yellow('⚠ Diff command not yet implemented'));
  console.log(chalk.dim('This will show a preview of changes before adding a component.\n'));
}
