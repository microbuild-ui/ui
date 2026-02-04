/**
 * Microbuild CLI - Validate Command
 * 
 * Validates the Microbuild installation in a project:
 * - Checks for untransformed @microbuild/* imports
 * - Verifies all component files exist
 * - Checks for missing CSS files
 * - Validates required lib modules are present
 * - Suggests fixes for common issues
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import fg from 'fast-glob';
import { type Config, loadConfig } from './init.js';

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

interface ValidationError {
  file: string;
  line?: number;
  message: string;
  code: string;
}

interface ValidationWarning {
  file: string;
  message: string;
  code: string;
}

/**
 * Check for untransformed @microbuild/* imports
 */
async function checkUntransformedImports(
  cwd: string,
  config: Config
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const patterns = [
    path.join(srcDir, 'components/**/*.{ts,tsx,js,jsx}'),
    path.join(srcDir, 'lib/microbuild/**/*.{ts,tsx,js,jsx}'),
  ];
  
  for (const pattern of patterns) {
    const files = await fg(pattern, { ignore: ['**/node_modules/**'] });
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for @microbuild/* imports (not in comments)
        if (
          line.includes("from '@microbuild/") && 
          !line.trim().startsWith('//') &&
          !line.trim().startsWith('*')
        ) {
          errors.push({
            file: path.relative(cwd, file),
            line: index + 1,
            message: `Untransformed import: ${line.trim()}`,
            code: 'UNTRANSFORMED_IMPORT',
          });
        }
      });
    }
  }
  
  return errors;
}

/**
 * Check for missing CSS files that components might need
 */
async function checkMissingCssFiles(
  cwd: string,
  config: Config
): Promise<ValidationWarning[]> {
  const warnings: ValidationWarning[] = [];
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const componentsDir = path.join(srcDir, 'components/ui');
  
  // Components that require CSS files
  const cssRequirements: Record<string, string> = {
    'input-block-editor.tsx': 'InputBlockEditor.css',
    'rich-text-html.tsx': 'RichTextHTML.css',
    'rich-text-markdown.tsx': 'RichTextMarkdown.css',
  };
  
  for (const [component, cssFile] of Object.entries(cssRequirements)) {
    const componentPath = path.join(componentsDir, component);
    const cssPath = path.join(componentsDir, cssFile);
    
    if (fs.existsSync(componentPath) && !fs.existsSync(cssPath)) {
      warnings.push({
        file: cssFile,
        message: `Missing CSS file for ${component}`,
        code: 'MISSING_CSS',
      });
    }
  }
  
  return warnings;
}

/**
 * Check for missing lib modules
 */
async function checkLibModules(
  cwd: string,
  config: Config
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const libDir = path.join(srcDir, 'lib/microbuild');
  
  // Required lib modules based on installed components
  const requiredModules: Record<string, string[]> = {
    types: ['types/index.ts', 'types/core.ts'],
    services: ['services/index.ts', 'services/api-request.ts'],
    hooks: ['hooks/index.ts'],
    utils: ['utils.ts', 'field-interface-mapper.ts'],
  };
  
  for (const [module, files] of Object.entries(requiredModules)) {
    if (config.installedLib.includes(module)) {
      for (const file of files) {
        const filePath = path.join(libDir, file);
        if (!fs.existsSync(filePath)) {
          errors.push({
            file: `lib/microbuild/${file}`,
            message: `Missing required file for ${module} module`,
            code: 'MISSING_LIB_FILE',
          });
        }
      }
    }
  }
  
  // Check for interface-registry.ts if define-interface.ts exists
  const defineInterfacePath = path.join(libDir, 'define-interface.ts');
  const interfaceRegistryPath = path.join(libDir, 'interface-registry.ts');
  
  if (fs.existsSync(defineInterfacePath) && !fs.existsSync(interfaceRegistryPath)) {
    errors.push({
      file: 'lib/microbuild/interface-registry.ts',
      message: 'Missing interface-registry.ts (required by define-interface.ts)',
      code: 'MISSING_INTERFACE_REGISTRY',
    });
  }
  
  return errors;
}

/**
 * Check for SSR-unsafe component usage
 */
async function checkSsrIssues(
  cwd: string,
  config: Config
): Promise<ValidationWarning[]> {
  const warnings: ValidationWarning[] = [];
  
  const srcDir = config.srcDir ? path.join(cwd, 'src') : cwd;
  const componentsDir = path.join(srcDir, 'components/ui');
  
  // Check if InputBlockEditor is exported without SSR protection
  const indexPath = path.join(componentsDir, 'index.ts');
  
  if (fs.existsSync(indexPath)) {
    const content = await fs.readFile(indexPath, 'utf-8');
    
    // Check for direct InputBlockEditor export without wrapper
    if (
      content.includes('InputBlockEditor') && 
      !content.includes('input-block-editor-wrapper') &&
      content.includes("from './input-block-editor'")
    ) {
      warnings.push({
        file: 'components/ui/index.ts',
        message: 'InputBlockEditor exported directly may cause SSR errors. Use input-block-editor-wrapper instead.',
        code: 'SSR_UNSAFE_EXPORT',
      });
    }
  }
  
  return warnings;
}

/**
 * Check for missing API routes
 */
async function checkApiRoutes(cwd: string): Promise<ValidationWarning[]> {
  const warnings: ValidationWarning[] = [];
  
  const apiDir = path.join(cwd, 'app/api');
  
  // Required API routes for DaaS integration
  const requiredRoutes = [
    'fields/[collection]/route.ts',
    'items/[collection]/route.ts',
    'items/[collection]/[id]/route.ts',
    'permissions/me/route.ts',
  ];
  
  if (fs.existsSync(apiDir)) {
    for (const route of requiredRoutes) {
      const routePath = path.join(apiDir, route);
      if (!fs.existsSync(routePath)) {
        warnings.push({
          file: `app/api/${route}`,
          message: 'Missing API route for DaaS integration',
          code: 'MISSING_API_ROUTE',
        });
      }
    }
  }
  
  return warnings;
}

/**
 * Generate suggestions based on errors and warnings
 */
function generateSuggestions(
  errors: ValidationError[],
  warnings: ValidationWarning[]
): string[] {
  const suggestions: string[] = [];
  
  // Untransformed imports
  const untransformedCount = errors.filter(e => e.code === 'UNTRANSFORMED_IMPORT').length;
  if (untransformedCount > 0) {
    suggestions.push(
      `Fix ${untransformedCount} untransformed import(s) by running: pnpm cli add --all --overwrite --cwd .`
    );
  }
  
  // Missing lib files
  const missingLibCount = errors.filter(e => e.code === 'MISSING_LIB_FILE').length;
  if (missingLibCount > 0) {
    suggestions.push(
      `Reinstall lib modules with: pnpm cli add vform --overwrite --cwd .`
    );
  }
  
  // Missing interface registry
  if (errors.some(e => e.code === 'MISSING_INTERFACE_REGISTRY')) {
    suggestions.push(
      `Add missing interface-registry.ts by reinstalling utils module`
    );
  }
  
  // Missing CSS files
  const missingCssCount = warnings.filter(w => w.code === 'MISSING_CSS').length;
  if (missingCssCount > 0) {
    suggestions.push(
      `Copy missing CSS files from microbuild-ui-packages/packages/ui-interfaces/src/`
    );
  }
  
  // SSR issues
  if (warnings.some(w => w.code === 'SSR_UNSAFE_EXPORT')) {
    suggestions.push(
      `Update components/ui/index.ts to export InputBlockEditor from './input-block-editor-wrapper'`
    );
  }
  
  // Missing API routes
  const missingRouteCount = warnings.filter(w => w.code === 'MISSING_API_ROUTE').length;
  if (missingRouteCount > 0) {
    suggestions.push(
      `Create missing API routes using templates from microbuild-copilot/.github/templates/api/`
    );
  }
  
  return suggestions;
}

/**
 * Main validate command
 */
export async function validate(options: {
  cwd: string;
  json?: boolean;
  fix?: boolean;
}) {
  const { cwd, json = false, fix = false } = options;
  
  // Load config
  const config = await loadConfig(cwd);
  if (!config) {
    if (json) {
      console.log(JSON.stringify({
        valid: false,
        errors: [{ file: 'microbuild.json', message: 'Not found', code: 'NO_CONFIG' }],
        warnings: [],
        suggestions: ['Run "npx microbuild init" first'],
      }));
    } else {
      console.log(chalk.red('\n✗ microbuild.json not found. Run "npx microbuild init" first.\n'));
    }
    process.exit(1);
  }
  
  const spinner = json ? null : ora('Validating Microbuild installation...').start();
  
  try {
    // Run all checks
    const [
      untransformedErrors,
      missingCssWarnings,
      libModuleErrors,
      ssrWarnings,
      apiRouteWarnings,
    ] = await Promise.all([
      checkUntransformedImports(cwd, config),
      checkMissingCssFiles(cwd, config),
      checkLibModules(cwd, config),
      checkSsrIssues(cwd, config),
      checkApiRoutes(cwd),
    ]);
    
    const errors = [...untransformedErrors, ...libModuleErrors];
    const warnings = [...missingCssWarnings, ...ssrWarnings, ...apiRouteWarnings];
    const suggestions = generateSuggestions(errors, warnings);
    
    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
    
    if (json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    
    // Display results
    if (errors.length === 0 && warnings.length === 0) {
      spinner?.succeed(chalk.green('Microbuild installation is valid! ✓'));
      console.log(chalk.dim(`\n  ${config.installedComponents.length} components installed`));
      console.log(chalk.dim(`  ${config.installedLib.length} lib modules installed\n`));
      return;
    }
    
    spinner?.stop();
    
    // Show errors
    if (errors.length > 0) {
      console.log(chalk.red(`\n✗ Found ${errors.length} error(s):\n`));
      errors.forEach(error => {
        const location = error.line ? `:${error.line}` : '';
        console.log(chalk.red(`  ✗ ${error.file}${location}`));
        console.log(chalk.dim(`    ${error.message}`));
      });
    }
    
    // Show warnings
    if (warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠ Found ${warnings.length} warning(s):\n`));
      warnings.forEach(warning => {
        console.log(chalk.yellow(`  ⚠ ${warning.file}`));
        console.log(chalk.dim(`    ${warning.message}`));
      });
    }
    
    // Show suggestions
    if (suggestions.length > 0) {
      console.log(chalk.cyan('\n💡 Suggestions:\n'));
      suggestions.forEach((suggestion, i) => {
        console.log(chalk.cyan(`  ${i + 1}. ${suggestion}`));
      });
    }
    
    console.log();
    
    if (errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    spinner?.fail('Validation failed');
    console.error(error);
    process.exit(1);
  }
}
