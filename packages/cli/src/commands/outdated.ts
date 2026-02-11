/**
 * Microbuild CLI - Outdated Command
 * 
 * Checks for component updates by comparing installed versions
 * to the current registry version.
 */

import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from './init.js';
import {
  getRegistry as fetchRegistry,
  type Registry,
} from '../resolver.js';

/**
 * Load registry (local or remote via resolver)
 */
async function getRegistry(): Promise<Registry> {
  try {
    return await fetchRegistry();
  } catch (err: any) {
    console.error(chalk.red('Failed to load registry:', err.message));
    process.exit(1);
  }
}

/**
 * Main outdated command
 */
export async function outdated(options: {
  cwd: string;
  json?: boolean;
}) {
  const { cwd, json = false } = options;
  
  // Load config
  const config = await loadConfig(cwd);
  if (!config) {
    if (json) {
      console.log(JSON.stringify({ error: 'microbuild.json not found' }));
    } else {
      console.log(chalk.red('\n✗ microbuild.json not found. Run "npx microbuild init" first.\n'));
    }
    process.exit(1);
  }
  
  const spinner = json ? null : ora('Checking for updates...').start();
  
  try {
    const registry = await getRegistry();
    const result: OutdatedResult = {
      outdated: [],
      upToDate: [],
      unknown: [],
      registryVersion: registry.version,
      installedRegistryVersion: config.registryVersion,
    };
    
    // Check each installed component
    for (const componentName of config.installedComponents) {
      const versionInfo = config.componentVersions?.[componentName];
      
      if (!versionInfo) {
        // No version info - installed before version tracking
        result.unknown.push(componentName);
      } else if (versionInfo.version !== registry.version) {
        // Outdated
        result.outdated.push({
          name: componentName,
          installedVersion: versionInfo.version,
          latestVersion: registry.version,
          installedAt: versionInfo.installedAt,
        });
      } else {
        // Up to date
        result.upToDate.push(componentName);
      }
    }
    
    // Check lib modules too
    for (const libName of config.installedLib) {
      const versionInfo = config.componentVersions?.[`lib/${libName}`];
      
      if (!versionInfo) {
        result.unknown.push(`lib/${libName}`);
      }
    }
    
    spinner?.stop();
    
    if (json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    
    // Display results
    console.log(chalk.bold('\n📦 Component Update Status\n'));
    console.log(chalk.dim(`Registry version: ${registry.version}`));
    if (config.registryVersion) {
      console.log(chalk.dim(`Installed at registry version: ${config.registryVersion}\n`));
    } else {
      console.log(chalk.dim(`Installed at registry version: unknown\n`));
    }
    
    if (result.outdated.length > 0) {
      console.log(chalk.yellow(`\n⚠ ${result.outdated.length} component(s) have updates available:\n`));
      
      for (const comp of result.outdated) {
        const installedDate = new Date(comp.installedAt).toLocaleDateString();
        console.log(chalk.yellow(`  ${comp.name}`));
        console.log(chalk.dim(`    ${comp.installedVersion} → ${comp.latestVersion} (installed ${installedDate})`));
      }
      
      console.log(chalk.dim('\n  Update with:'));
      console.log(chalk.cyan(`    npx microbuild add ${result.outdated.map(c => c.name).join(' ')} --overwrite\n`));
    }
    
    if (result.unknown.length > 0) {
      console.log(chalk.dim(`\n  ${result.unknown.length} component(s) without version info (installed before tracking):`));
      result.unknown.forEach(name => console.log(chalk.dim(`    - ${name}`)));
      console.log(chalk.dim('\n  Reinstall with --overwrite to enable version tracking.'));
    }
    
    if (result.outdated.length === 0 && result.unknown.length === 0) {
      console.log(chalk.green('✓ All components are up to date!\n'));
    }
    
    // Summary
    console.log(chalk.dim(`\nTotal: ${config.installedComponents.length} components, ${config.installedLib.length} lib modules`));
    console.log(chalk.dim(`  Up to date: ${result.upToDate.length}`));
    console.log(chalk.dim(`  Outdated: ${result.outdated.length}`));
    console.log(chalk.dim(`  Unknown: ${result.unknown.length}\n`));
    
  } catch (error) {
    spinner?.fail('Failed to check for updates');
    console.error(chalk.red(error));
    process.exit(1);
  }
}
