import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
