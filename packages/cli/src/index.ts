#!/usr/bin/env node
/**
 * Microbuild CLI
 * 
 * Copy & Own CLI tool for adding Microbuild components to your project.
 * 
 * Benefits:
 * ✅ No dependency on external packages for component code
 * ✅ Full customization - components become part of your codebase
 * ✅ No breaking changes from upstream updates
 * ✅ Bundle only what you use - tree-shaking friendly
 * ✅ Works offline after installation
 */

import { Command } from 'commander';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { list } from './commands/list.js';
import { diff } from './commands/diff.js';
import { status } from './commands/status.js';
import { info } from './commands/info.js';
import { tree } from './commands/tree.js';

const program = new Command();

program
  .name('microbuild')
  .description('Copy & Own CLI - Add Microbuild components to your project')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize Microbuild in your project (creates microbuild.json)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-c, --cwd <path>', 'Project directory', process.cwd())
  .action(init);

program
  .command('add')
  .description('Copy components to your project (with transformed imports)')
  .argument('[components...]', 'Component names to add')
  .option('-a, --all', 'Add all components')
  .option('--category <name>', 'Add all components from a category')
  .option('-o, --overwrite', 'Overwrite existing components')
  .option('--cwd <path>', 'Project directory', process.cwd())
  .action(add);

program
  .command('list')
  .description('List all available components')
  .option('--category <name>', 'Filter by category')
  .option('--json', 'Output as JSON')
  .option('--cwd <path>', 'Project directory', process.cwd())
  .action(list);

program
  .command('diff')
  .description('Preview changes before adding a component')
  .argument('<component>', 'Component name')
  .option('--cwd <path>', 'Project directory', process.cwd())
  .action(diff);

program
  .command('status')
  .description('Show installed Microbuild components and their origins')
  .option('--json', 'Output as JSON')
  .option('--cwd <path>', 'Project directory', process.cwd())
  .action(status);

program
  .command('info')
  .description('Show detailed information about a component (sources, dependencies, interface)')
  .argument('<component>', 'Component name')
  .option('--json', 'Output as JSON')
  .action(info);

program
  .command('tree')
  .description('Display dependency tree for a component')
  .argument('<component>', 'Component name')
  .option('--json', 'Output as JSON')
  .option('-d, --depth <number>', 'Max depth to display', '2')
  .action((component, options) => tree(component, { ...options, depth: parseInt(options.depth) }));

program.parse();
