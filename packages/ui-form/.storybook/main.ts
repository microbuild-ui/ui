import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

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
    });
  },
};

export default config;
