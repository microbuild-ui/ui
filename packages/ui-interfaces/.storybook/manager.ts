import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'light',
  brandTitle: '@microbuild/ui-interfaces',
  brandUrl: 'https://github.com/microbuild',
  
  // UI
  appBg: '#f8f9fa',
  appContentBg: '#ffffff',
  appBorderColor: '#dee2e6',
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: '"Fira Code", "Fira Mono", monospace',

  // Colors
  colorPrimary: '#228be6',
  colorSecondary: '#228be6',

  // Toolbar default and active colors
  barTextColor: '#495057',
  barSelectedColor: '#228be6',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#ced4da',
  inputTextColor: '#212529',
  inputBorderRadius: 4,
});

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
  },
});
