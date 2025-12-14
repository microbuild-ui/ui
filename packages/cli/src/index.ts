#!/usr/bin/env node
/**
 * Microbuild CLI
 * 
 * CLI tool for adding Microbuild components to your project, similar to shadcn/ui.
 */

import { Command } from 'commander';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { list } from './commands/list.js';
import { diff } from './commands/diff.js';

const program = new Command();

program
  .name('microbuild')
  .description('Add Microbuild components to your project')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize Microbuild in your project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-c, --cwd <path>', 'Project directory', process.cwd())
  .action(init);

program
  .command('add')
  .description('Add components to your project')
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
  .action(list);

program
  .command('diff')
  .description('Preview changes before adding a component')
  .argument('<component>', 'Component name')
  .option('--cwd <path>', 'Project directory', process.cwd())
  .action(diff);

program.parse();
