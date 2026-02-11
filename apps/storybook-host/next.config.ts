import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Trace files from the monorepo root so standalone output includes workspace deps
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),

  // Rewrite clean URLs to Storybook index.html files served from public/
  async rewrites() {
    return {
      beforeFiles: [
        // /storybook/form → /storybook/form/index.html
        { source: '/storybook/:name', destination: '/storybook/:name/index.html' },
        // /storybook/form/ → /storybook/form/index.html
        { source: '/storybook/:name/', destination: '/storybook/:name/index.html' },
      ],
    };
  },
};

export default nextConfig;
