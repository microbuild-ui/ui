import React from 'react';
import type { Preview } from '@storybook/react';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import './preview.css';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, sans-serif',
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1b1e' },
        { name: 'gray', value: '#f8f9fa' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={theme}>
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
};

export default preview;
