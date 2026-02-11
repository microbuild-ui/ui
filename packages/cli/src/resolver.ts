/**
 * Remote/Local Source Resolver
 *
 * Abstracts file fetching so the CLI works in two modes:
 *
 * 1. **Remote mode** (default when installed via npm / npx)
 *    Fetches registry.json and component source files from the GitHub raw CDN.
 *
 * 2. **Local mode** (when running from the monorepo checkout)
 *    Reads files directly from the `packages/` directory on disk.
 *
 * The mode is determined automatically:
 *   - If `PACKAGES_ROOT/registry.json` exists on disk → local mode
 *   - Otherwise → remote mode (uses REGISTRY_BASE_URL)
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuration ───────────────────────────────────────────────

/**
 * Base URL for fetching files remotely.
 * Points to the raw GitHub content of the `main` branch.
 *
 * Override at runtime with the `MICROBUILD_REGISTRY_URL` env var.
 *
 * ⚠️  REPLACE the placeholder below with your actual GitHub org/repo.
 */
const DEFAULT_REGISTRY_URL =
  'https://raw.githubusercontent.com/microbuild-ui/ui/main/packages';

/**
 * Runtime-configurable registry URL.
 */
export const REGISTRY_BASE_URL =
  process.env.MICROBUILD_REGISTRY_URL ?? DEFAULT_REGISTRY_URL;

// Local packages root (only valid when running from monorepo)
// From dist/index.js → packages/cli/dist → needs ../../ to reach packages/
const LOCAL_PACKAGES_ROOT = path.resolve(__dirname, '../..');

/**
 * Detect whether we are running locally inside the monorepo.
 */
function isLocalMode(): boolean {
  return fs.existsSync(path.join(LOCAL_PACKAGES_ROOT, 'registry.json'));
}

// ─── Public API ──────────────────────────────────────────────────

export interface Registry {
  version: string;
  name: string;
  lib: Record<string, LibModule>;
  components: ComponentEntry[];
  categories: Array<{ name: string; title: string; description: string }>;
  dependencies?: Record<string, string[]>;
  aliases?: Record<string, string>;
  meta?: Record<string, unknown>;
}

export interface FileMapping {
  source: string;
  target: string;
}

export interface LibModule {
  name: string;
  description: string;
  files?: FileMapping[];
  path?: string;
  target?: string;
  internalDependencies?: string[];
}

export interface ComponentEntry {
  name: string;
  title: string;
  description: string;
  category: string;
  files: FileMapping[];
  dependencies: string[];
  internalDependencies: string[];
  registryDependencies?: string[];
}

// In-memory cache so we fetch registry.json at most once per CLI invocation
let _registryCache: Registry | null = null;

/**
 * Load registry.json (local or remote).
 */
export async function getRegistry(): Promise<Registry> {
  if (_registryCache) return _registryCache;

  if (isLocalMode()) {
    const registryPath = path.join(LOCAL_PACKAGES_ROOT, 'registry.json');
    _registryCache = await fs.readJSON(registryPath) as Registry;
  } else {
    const url = `${REGISTRY_BASE_URL}/registry.json`;
    _registryCache = await fetchJSON<Registry>(url);
  }

  return _registryCache;
}

/**
 * Read a source file referenced in registry.json.
 *
 * @param source – the `source` field from a FileMapping, e.g. `"types/src/core.ts"`
 * @returns the file content as a UTF-8 string
 */
export async function resolveSourceFile(source: string): Promise<string> {
  if (isLocalMode()) {
    const fullPath = path.join(LOCAL_PACKAGES_ROOT, source);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Source file not found on disk: ${fullPath}`);
    }
    return fs.readFile(fullPath, 'utf-8');
  }

  // Remote mode
  const url = `${REGISTRY_BASE_URL}/${source}`;
  return fetchText(url);
}

/**
 * Check whether a source file exists.
 * In remote mode we optimistically return `true` (the registry is the manifest).
 */
export async function sourceFileExists(source: string): Promise<boolean> {
  if (isLocalMode()) {
    return fs.existsSync(path.join(LOCAL_PACKAGES_ROOT, source));
  }
  // In remote mode, trust the registry – the file should exist.
  return true;
}

/**
 * Resolve a template file (used by `init` command).
 * Templates are bundled inside the CLI package under `dist/templates/`.
 * When running locally they live in `packages/cli/templates/`.
 */
export function getTemplatesRoot(): string {
  // When built, templates are copied into dist/templates by tsup copy plugin
  const builtTemplates = path.resolve(__dirname, 'templates');
  if (fs.existsSync(builtTemplates)) return builtTemplates;

  // Fallback: running locally from source
  const localTemplates = path.resolve(__dirname, '../templates');
  if (fs.existsSync(localTemplates)) return localTemplates;

  throw new Error(
    'Templates directory not found. Ensure the CLI is built correctly.'
  );
}

/**
 * Return the local PACKAGES_ROOT (only meaningful in local mode).
 * Falls back gracefully so remote-mode callers don't break.
 */
export function getLocalPackagesRoot(): string {
  return LOCAL_PACKAGES_ROOT;
}

// ─── HTTP helpers ────────────────────────────────────────────────

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${res.status} ${res.statusText}`
    );
  }
  return res.text();
}

async function fetchJSON<T>(url: string): Promise<T> {
  const text = await fetchText(url);
  return JSON.parse(text) as T;
}
