import React from 'react';
import type { Preview } from '@storybook/react';
import { MantineProvider, createTheme } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './preview.css';

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
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={theme} defaultColorScheme="light">
        <div className="sb-decorator-pad">
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
