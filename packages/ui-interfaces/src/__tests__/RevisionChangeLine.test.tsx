import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { RevisionChangeLine } from '../workflow-button';
import type { Change } from '../workflow-button';

// Helper function to render components with Mantine provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('RevisionChangeLine', () => {
  describe('Added Type', () => {
    it('renders added content with plus icon styling', () => {
      const changes: Change[] = [{ added: true, value: 'New content' }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText('New content')).toBeInTheDocument();
    });

    it('filters out removed content for added type', () => {
      const changes: Change[] = [
        { removed: true, value: 'Old content' },
        { added: true, value: 'New content' },
      ];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText('New content')).toBeInTheDocument();
      expect(screen.queryByText('Old content')).not.toBeInTheDocument();
    });
  });

  describe('Deleted Type', () => {
    it('renders deleted content with minus icon styling', () => {
      const changes: Change[] = [{ removed: true, value: 'Deleted content' }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="deleted" />);

      expect(screen.getByText('Deleted content')).toBeInTheDocument();
    });

    it('filters out added content for deleted type', () => {
      const changes: Change[] = [
        { removed: true, value: 'Old content' },
        { added: true, value: 'New content' },
      ];

      renderWithProvider(<RevisionChangeLine changes={changes} type="deleted" />);

      expect(screen.getByText('Old content')).toBeInTheDocument();
      expect(screen.queryByText('New content')).not.toBeInTheDocument();
    });
  });

  describe('Updated Type', () => {
    it('renders updated indicator for concealed fields', () => {
      const changes: Change[] = [{ updated: true, value: '***' }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="updated" />);

      expect(screen.getByText('Field value was updated (concealed)')).toBeInTheDocument();
    });

    it('shows all changes for updated type', () => {
      const changes: Change[] = [
        { value: 'First' },
        { value: 'Second' },
      ];

      renderWithProvider(<RevisionChangeLine changes={changes} type="updated" />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('renders string values correctly', () => {
      const changes: Change[] = [{ value: 'Simple string' }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText('Simple string')).toBeInTheDocument();
    });

    it('renders object values as JSON', () => {
      const changes: Change[] = [{ value: { key: 'value' } }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText(/key.*value/)).toBeInTheDocument();
    });

    it('renders null/undefined as no value indicator', () => {
      const changes: Change[] = [{ value: null }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText('(no value)')).toBeInTheDocument();
    });

    it('renders number values correctly', () => {
      const changes: Change[] = [{ value: 42 }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders boolean values correctly', () => {
      const changes: Change[] = [{ value: true }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText('true')).toBeInTheDocument();
    });
  });

  describe('Array Values', () => {
    it('renders array values as JSON', () => {
      const changes: Change[] = [{ value: ['item1', 'item2'] }];

      renderWithProvider(<RevisionChangeLine changes={changes} type="added" />);

      expect(screen.getByText(/item1.*item2/)).toBeInTheDocument();
    });
  });
});
