import { defineConfig } from 'tsup';
import { cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __tsupDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  shims: true,
  onSuccess: async () => {
    // Copy templates into dist/ so they ship with the npm package
    cpSync(
      resolve(__tsupDir, 'templates'),
      resolve(__tsupDir, 'dist/templates'),
      { recursive: true }
    );
    console.log('✓ Copied templates → dist/templates');
  },
});
