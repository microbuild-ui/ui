import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const __dirname = import.meta.dirname;

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        // Filter out node_modules except @mantine
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules') ||
                 prop.parent.fileName.includes('@mantine');
        }
        return true;
      },
    },
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@microbuild/types': path.resolve(__dirname, '../../types/src'),
          '@microbuild/services': path.resolve(__dirname, '../../services/src'),
          '@microbuild/hooks': path.resolve(__dirname, '../../hooks/src'),
          '@microbuild/ui-form': path.resolve(__dirname, '../../ui-form/src'),
          '@microbuild/ui-table': path.resolve(__dirname, '../../ui-table/src'),
          '@microbuild/ui-collections': path.resolve(__dirname, '../../ui-collections/src'),
          '@microbuild/utils': path.resolve(__dirname, '../../utils/src'),
        },
      },
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      },
    });
  },
};

export default config;
