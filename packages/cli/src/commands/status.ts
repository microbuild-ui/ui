/**
 * Buildpad CLI - Status Command
 * 
 * Scans project for microbuild-installed files and shows:
 * - Which components are installed
 * - Their versions and install dates
 * - Whether they've been modified
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { loadConfig, resolveAlias } from './init.js';
import { extractOriginInfo, hasBuildpadOrigin } from './transformer.js';

interface InstalledFile {
  path: string;
  origin: string;
  version: string;
  date: string;
  modified: boolean;
}

/**
 * Recursively find all files with microbuild origin headers
 */
async function findBuildpadFiles(dir: string): Promise<InstalledFile[]> {
  const files: InstalledFile[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        const subFiles = await findBuildpadFiles(fullPath);
        files.push(...subFiles);
      }
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      const content = await fs.readFile(fullPath, 'utf-8');
      
      if (hasBuildpadOrigin(content)) {
        const info = extractOriginInfo(content);
        if (info && info.origin) {
          files.push({
            path: fullPath,
            origin: info.origin,
            version: info.version || 'unknown',
            date: info.date || 'unknown',
            modified: false, // TODO: Compare with registry hash
          });
        }
      }
    }
  }
  
  return files;
}

/**
 * Group files by component/lib
 */
function groupByOrigin(files: InstalledFile[]): Map<string, InstalledFile[]> {
  const groups = new Map<string, InstalledFile[]>();
  
  for (const file of files) {
    const [pkg, component] = file.origin.split('/').slice(0, 2);
    const key = `${pkg}/${component || 'root'}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(file);
  }
  
  return groups;
}

/**
 * Main status command
 */
export async function status(options: { cwd: string; json?: boolean }) {
  const { cwd, json = false } = options;

  const config = await loadConfig(cwd);
  if (!config) {
    console.log(chalk.red('\n✗ microbuild.json not found.\n'));
    console.log('This project may not be initialized with Buildpad.');
    console.log('Run "npx @microbuild/cli init" to initialize.\n');
    return;
  }

  // Scan for installed files
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const files = await findBuildpadFiles(srcDir);

  if (json) {
    console.log(JSON.stringify({
      config: {
        installedLib: config.installedLib,
        installedComponents: config.installedComponents,
      },
      files: files.map(f => ({
        ...f,
        path: path.relative(cwd, f.path),
      })),
    }, null, 2));
    return;
  }

  // Pretty print
  console.log('\n' + chalk.bold('📦 Buildpad Status\n'));
  
  console.log(chalk.gray('Config file: ') + 'microbuild.json');
  console.log(chalk.gray('Lib modules: ') + (config.installedLib.join(', ') || 'none'));
  console.log(chalk.gray('Components:  ') + (config.installedComponents.join(', ') || 'none'));
  
  if (files.length === 0) {
    console.log('\n' + chalk.yellow('No files with @microbuild-origin headers found.'));
    console.log(chalk.gray('This may mean components were installed before origin tracking was added.'));
    return;
  }

  const groups = groupByOrigin(files);
  
  console.log('\n' + chalk.bold('Installed Files:\n'));
  
  for (const [origin, groupFiles] of groups) {
    console.log(chalk.cyan(`  ${origin}`));
    for (const file of groupFiles) {
      const relativePath = path.relative(cwd, file.path);
      console.log(chalk.gray(`    └─ ${relativePath}`));
      console.log(chalk.gray(`       v${file.version} (${file.date})`));
    }
    console.log();
  }

  console.log(chalk.gray(`\nTotal: ${files.length} files from Buildpad\n`));
}
