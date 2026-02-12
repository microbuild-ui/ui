import React from 'react';
import type { Preview } from '@storybook/react';
import { MantineProvider, createTheme } from '@mantine/core';

// Import Mantine CSS
import '@mantine/core/styles.css';

// Import VTable CSS
import '../src/VTable.css';

// Import preview styles
import './preview.css';

// Create a default theme
const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  defaultRadius: 'sm',
});

/**
 * API requests in Storybook
 *
 * All /api/* calls are proxied to the Storybook Host app (apps/storybook-host)
 * which handles authentication and forwards requests to DaaS.
 *
 * No mocking is needed — if the host isn't running, the stories
 * will show an appropriate connection error.
 */

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
    layout: 'padded',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <MantineProvider theme={theme} defaultColorScheme="light">
        <div className="storybook-wrapper">
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
