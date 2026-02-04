import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig, loadEnv } from 'vite';
import path from 'path';

/**
 * DaaS Proxy Configuration
 * 
 * To enable DaaS API proxying in Storybook, create a .env.local file in packages/ui-form/:
 * 
 *   STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com
 *   STORYBOOK_DAAS_TOKEN=your-static-token
 * 
 * Or pass environment variables when starting Storybook:
 * 
 *   STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \
 *   STORYBOOK_DAAS_TOKEN=your-token \
 *   pnpm storybook:form
 * 
 * This allows Storybook to proxy /api/* requests to DaaS, avoiding CORS issues.
 */

// Load environment variables from .env.local file
const env = loadEnv('development', path.resolve(__dirname, '..'), 'STORYBOOK_');
const DAAS_URL = env.STORYBOOK_DAAS_URL || process.env.STORYBOOK_DAAS_URL || '';
const DAAS_TOKEN = env.STORYBOOK_DAAS_TOKEN || process.env.STORYBOOK_DAAS_TOKEN || '';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules') ||
                 prop.parent.fileName.includes('@mantine') ||
                 prop.parent.fileName.includes('@microbuild');
        }
        return true;
      },
    },
  },
  viteFinal: async (config) => {
    // Build proxy configuration if DaaS env vars are set
    const proxyConfig: Record<string, unknown> = {};
    
    if (DAAS_URL) {
      // Proxy all /api/* requests to DaaS
      // This avoids CORS issues when testing relational interfaces
      // DaaS API uses /api/ prefix, so we keep the path as-is
      proxyConfig['/api'] = {
        target: DAAS_URL,
        changeOrigin: true,
        secure: true,
        // No rewrite needed - DaaS API expects /api/collections, /api/fields, etc.
        // Add authorization header to proxied requests (except auth endpoints)
        configure: (proxy: any) => {
          proxy.on('proxyReq', (proxyReq: any, req: any) => {
            // Don't add static token to auth endpoints - they handle their own auth
            const isAuthEndpoint = req.url?.startsWith('/api/auth/');
            
            // Check if request already has an Authorization header (from login session)
            const existingAuth = proxyReq.getHeader('Authorization');
            
            if (DAAS_TOKEN && !isAuthEndpoint && !existingAuth) {
              proxyReq.setHeader('Authorization', `Bearer ${DAAS_TOKEN}`);
            }
            console.log(`[Storybook Proxy] ${req.method} ${req.url} → ${DAAS_URL}${req.url}${isAuthEndpoint ? ' (auth endpoint)' : ''}`);
          });
        },
      };
      
      console.log(`[Storybook] DaaS proxy enabled: /api/* → ${DAAS_URL}/api/*`);
    }
    
    return mergeConfig(config, {
      resolve: {
        alias: {
          // Map workspace packages for Storybook
          '@microbuild/types': path.resolve(__dirname, '../../types/src'),
          '@microbuild/services': path.resolve(__dirname, '../../services/src'),
          '@microbuild/ui-interfaces': path.resolve(__dirname, '../../ui-interfaces/src'),
          '@microbuild/utils': path.resolve(__dirname, '../../utils/src'),
          '@microbuild/hooks': path.resolve(__dirname, '../../hooks/src'),
        },
      },
      server: {
        proxy: Object.keys(proxyConfig).length > 0 ? proxyConfig : undefined,
      },
    });
  },
};

export default config;
