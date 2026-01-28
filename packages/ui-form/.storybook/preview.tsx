import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { MantineProvider, createTheme } from '@mantine/core';

// Import Mantine CSS
import '@mantine/core/styles.css';

// Import VForm CSS
import '../src/VForm.css';

// Create a default theme
const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  defaultRadius: 'sm',
});

/**
 * Mock the services for Storybook
 * This allows VForm to work without a real API (for local stories)
 * DaaS stories bypass this by making direct fetch calls with full URLs
 */
if (typeof window !== 'undefined') {
  // Mock fetch for Storybook environment (only for relative URLs)
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Allow external URLs (DaaS, etc.) to pass through
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return originalFetch(input, init);
    }
    
    // Mock local /api/fields/ routes - return empty array (use fields prop instead)
    if (url.includes('/api/fields/')) {
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Mock local /api/items/ routes
    if (url.includes('/api/items/')) {
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Pass through all other requests
    return originalFetch(input, init);
  };
}

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
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
