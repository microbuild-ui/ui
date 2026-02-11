import React from 'react';
import type { Preview } from '@storybook/nextjs-vite';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

// Import Mantine CSS
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

// Create a default theme (can be customized)
const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  defaultRadius: 'sm',
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-right" />
        <div style={{ padding: '1rem', minWidth: '400px' }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
