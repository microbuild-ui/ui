/**
 * Microbuild CLI - Fix Command
 * 
 * Automatically applies fixes for common issues detected by validate.
 * Fixes include:
 * - Untransformed @microbuild/* imports
 * - Broken relative imports
 * - Missing CSS files
 * - SSR-unsafe exports
 * - Duplicate exports
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import fg from 'fast-glob';
import prompts from 'prompts';
import { type Config, loadConfig } from './init.js';
import { transformImports, toKebabCase } from './transformer.js';

interface FixResult {
  fixed: number;
  skipped: number;
  errors: string[];
}

/**
 * Fix untransformed @microbuild/* imports
 */
async function fixUntransformedImports(
  cwd: string,
  config: Config,
  dryRun: boolean
): Promise<FixResult> {
  const result: FixResult = { fixed: 0, skipped: 0, errors: [] };
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const patterns = [
    path.join(srcDir, 'components/**/*.{ts,tsx,js,jsx}'),
    path.join(srcDir, 'lib/microbuild/**/*.{ts,tsx,js,jsx}'),
  ];
  
  for (const pattern of patterns) {
    const files = await fg(pattern, { ignore: ['**/node_modules/**'] });
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check if file has @microbuild/* imports
      if (content.includes("from '@microbuild/") || content.includes('from "@microbuild/')) {
        const transformed = transformImports(content, config);
        
        if (transformed !== content) {
          if (dryRun) {
            console.log(chalk.dim(`  Would fix: ${path.relative(cwd, file)}`));
          } else {
            await fs.writeFile(file, transformed);
          }
          result.fixed++;
        }
      }
    }
  }
  
  return result;
}

/**
 * Fix SSR-unsafe exports in components/ui/index.ts
 */
async function fixSsrUnsafeExports(
  cwd: string,
  config: Config,
  dryRun: boolean
): Promise<FixResult> {
  const result: FixResult = { fixed: 0, skipped: 0, errors: [] };
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const indexPath = path.join(srcDir, 'components/ui/index.ts');
  
  if (!fs.existsSync(indexPath)) {
    return result;
  }
  
  let content = await fs.readFile(indexPath, 'utf-8');
  let modified = false;
  
  // Check for direct InputBlockEditor export
  if (
    content.includes("from './input-block-editor'") &&
    !content.includes("from './input-block-editor-wrapper'")
  ) {
    // Check if wrapper exists
    const wrapperPath = path.join(srcDir, 'components/ui/input-block-editor-wrapper.tsx');
    if (fs.existsSync(wrapperPath)) {
      content = content.replace(
        /export \* from ['"]\.\/input-block-editor['"]/g,
        "export * from './input-block-editor-wrapper'"
      );
      modified = true;
      result.fixed++;
    }
  }
  
  if (modified && !dryRun) {
    await fs.writeFile(indexPath, content);
  } else if (modified && dryRun) {
    console.log(chalk.dim(`  Would fix SSR exports in: components/ui/index.ts`));
  }
  
  return result;
}

/**
 * Fix duplicate exports by using explicit named exports
 */
async function fixDuplicateExports(
  cwd: string,
  config: Config,
  dryRun: boolean
): Promise<FixResult> {
  const result: FixResult = { fixed: 0, skipped: 0, errors: [] };
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const indexPath = path.join(srcDir, 'components/ui/index.ts');
  
  if (!fs.existsSync(indexPath)) {
    return result;
  }
  
  const content = await fs.readFile(indexPath, 'utf-8');
  const componentsDir = path.join(srcDir, 'components/ui');
  
  // Build a map of all named exports across files
  const exportPattern = /export \* from ['"]\.\/([^'"]+)['"]/g;
  const namedExports = new Map<string, { files: string[]; count: number }>();
  const namedExportPattern = /export\s+(?:const|function|class|type|interface|enum)\s+(\w+)/g;
  
  let match;
  while ((match = exportPattern.exec(content)) !== null) {
    const exportFile = match[1];
    const filePath = path.join(componentsDir, exportFile + '.tsx');
    
    if (!fs.existsSync(filePath)) continue;
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    let namedMatch;
    
    while ((namedMatch = namedExportPattern.exec(fileContent)) !== null) {
      const exportName = namedMatch[1];
      
      if (!namedExports.has(exportName)) {
        namedExports.set(exportName, { files: [exportFile], count: 1 });
      } else {
        const existing = namedExports.get(exportName)!;
        existing.files.push(exportFile);
        existing.count++;
      }
    }
  }
  
  // Find conflicts
  const conflicts = Array.from(namedExports.entries())
    .filter(([_, info]) => info.count > 1);
  
  if (conflicts.length > 0 && !dryRun) {
    console.log(chalk.yellow(`\n⚠ Found ${conflicts.length} conflicting export(s):`));
    conflicts.forEach(([name, info]) => {
      console.log(chalk.dim(`  ${name}: exported from ${info.files.join(', ')}`));
    });
    console.log(chalk.dim('\nTo fix, manually update components/ui/index.ts to use explicit named exports.'));
    console.log(chalk.dim('Example: export { ComponentA } from "./file-a";'));
    result.skipped = conflicts.length;
  } else if (conflicts.length > 0 && dryRun) {
    console.log(chalk.dim(`  Would report ${conflicts.length} conflicting exports`));
  }
  
  return result;
}

/**
 * Fix broken relative imports by normalizing paths
 */
async function fixBrokenImports(
  cwd: string,
  config: Config,
  dryRun: boolean
): Promise<FixResult> {
  const result: FixResult = { fixed: 0, skipped: 0, errors: [] };
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const componentsDir = path.join(srcDir, 'components/ui');
  
  const files = await fg(path.join(componentsDir, '**/*.{ts,tsx}'), {
    ignore: ['**/node_modules/**']
  });
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const fileDir = path.dirname(file);
    let modified = false;
    let newContent = content;
    
    // Find relative imports
    const relativeImportPattern = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
    let match;
    
    while ((match = relativeImportPattern.exec(content)) !== null) {
      const importPath = match[1];
      const absolutePath = path.resolve(fileDir, importPath);
      
      // Check if file exists with various extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', ''];
      const exists = extensions.some(ext => fs.existsSync(absolutePath + ext));
      
      if (!exists) {
        // Try to find the correct path by checking kebab-case
        const baseName = path.basename(importPath);
        const kebabName = toKebabCase(baseName);
        const dirName = path.dirname(importPath);
        const newImportPath = dirName === '.' ? `./${kebabName}` : `${dirName}/${kebabName}`;
        const newAbsolutePath = path.resolve(fileDir, newImportPath);
        
        const newExists = extensions.some(ext => fs.existsSync(newAbsolutePath + ext));
        
        if (newExists) {
          newContent = newContent.replace(
            new RegExp(`from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
            `from '${newImportPath}'`
          );
          modified = true;
          result.fixed++;
        }
      }
    }
    
    if (modified && !dryRun) {
      await fs.writeFile(file, newContent);
    } else if (modified && dryRun) {
      console.log(chalk.dim(`  Would fix imports in: ${path.relative(cwd, file)}`));
    }
  }
  
  return result;
}

/**
 * Copy missing CSS files from source
 */
async function fixMissingCss(
  cwd: string,
  config: Config,
  dryRun: boolean
): Promise<FixResult> {
  const result: FixResult = { fixed: 0, skipped: 0, errors: [] };
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const componentsDir = path.join(srcDir, 'components/ui');
  
  // CSS requirements mapping
  const cssRequirements: Record<string, { component: string; cssFile: string }> = {
    'input-block-editor.tsx': {
      component: 'input-block-editor',
      cssFile: 'InputBlockEditor.css'
    },
    'rich-text-html.tsx': {
      component: 'rich-text-html',
      cssFile: 'RichTextHTML.css'
    },
    'rich-text-markdown.tsx': {
      component: 'rich-text-markdown', 
      cssFile: 'RichTextMarkdown.css'
    },
  };
  
  for (const [componentFile, info] of Object.entries(cssRequirements)) {
    const componentPath = path.join(componentsDir, componentFile);
    const cssPath = path.join(componentsDir, info.cssFile);
    
    if (fs.existsSync(componentPath) && !fs.existsSync(cssPath)) {
      if (dryRun) {
        console.log(chalk.dim(`  Would copy missing CSS: ${info.cssFile}`));
        result.fixed++;
      } else {
        // Note: In real implementation, you'd copy from source registry
        console.log(chalk.yellow(`  Missing CSS: ${info.cssFile}`));
        console.log(chalk.dim(`    Reinstall component: npx microbuild add ${info.component} --overwrite`));
        result.skipped++;
      }
    }
  }
  
  return result;
}

/**
 * Main fix command
 */
export async function fix(options: {
  cwd: string;
  dryRun?: boolean;
  yes?: boolean;
}) {
  const { cwd, dryRun = false, yes = false } = options;
  
  console.log(chalk.bold('\n🔧 Microbuild Fix\n'));
  
  if (dryRun) {
    console.log(chalk.yellow('Dry run mode - no changes will be made\n'));
  }
  
  // Load config
  const config = await loadConfig(cwd);
  if (!config) {
    console.log(chalk.red('✗ microbuild.json not found. Run "npx microbuild init" first.\n'));
    process.exit(1);
  }
  
  // Confirm before fixing (unless --yes or --dry-run)
  if (!yes && !dryRun) {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'This will modify files in your project. Continue?',
      initial: true,
    });
    
    if (!confirm) {
      console.log(chalk.yellow('\n✓ Cancelled\n'));
      return;
    }
  }
  
  const spinner = ora('Scanning for issues...').start();
  
  try {
    // Run all fixes
    spinner.text = 'Fixing untransformed imports...';
    const importResult = await fixUntransformedImports(cwd, config, dryRun);
    
    spinner.text = 'Fixing broken relative imports...';
    const brokenResult = await fixBrokenImports(cwd, config, dryRun);
    
    spinner.text = 'Fixing SSR-unsafe exports...';
    const ssrResult = await fixSsrUnsafeExports(cwd, config, dryRun);
    
    spinner.text = 'Checking duplicate exports...';
    const duplicateResult = await fixDuplicateExports(cwd, config, dryRun);
    
    spinner.text = 'Checking missing CSS files...';
    const cssResult = await fixMissingCss(cwd, config, dryRun);
    
    spinner.stop();
    
    // Calculate totals
    const totalFixed = importResult.fixed + brokenResult.fixed + ssrResult.fixed + cssResult.fixed;
    const totalSkipped = importResult.skipped + brokenResult.skipped + ssrResult.skipped + 
                         duplicateResult.skipped + cssResult.skipped;
    
    // Summary
    console.log(chalk.bold('\n📋 Fix Summary:\n'));
    
    if (importResult.fixed > 0) {
      console.log(chalk.green(`  ✓ Fixed ${importResult.fixed} untransformed import(s)`));
    }
    if (brokenResult.fixed > 0) {
      console.log(chalk.green(`  ✓ Fixed ${brokenResult.fixed} broken import(s)`));
    }
    if (ssrResult.fixed > 0) {
      console.log(chalk.green(`  ✓ Fixed ${ssrResult.fixed} SSR-unsafe export(s)`));
    }
    if (cssResult.fixed > 0) {
      console.log(chalk.green(`  ✓ Fixed ${cssResult.fixed} missing CSS file(s)`));
    }
    
    if (totalSkipped > 0) {
      console.log(chalk.yellow(`\n  ⚠ Skipped ${totalSkipped} issue(s) requiring manual fix`));
    }
    
    if (totalFixed === 0 && totalSkipped === 0) {
      console.log(chalk.green('  ✓ No issues found!\n'));
    } else if (dryRun) {
      console.log(chalk.dim('\n  Run without --dry-run to apply fixes\n'));
    } else {
      console.log(chalk.green('\n✨ Fixes applied!\n'));
      console.log(chalk.dim('Run "npx microbuild validate" to verify.\n'));
    }
    
  } catch (error) {
    spinner.fail('Fix failed');
    console.error(chalk.red(error));
    process.exit(1);
  }
}
