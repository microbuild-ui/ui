import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { RevisionsDrawerUpdates } from '../workflow-button';
import type { Revision } from '../workflow-button';

// Helper function to render components with Mantine provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('RevisionsDrawerUpdates', () => {
  const createRevision = (overrides: Partial<Revision> = {}): Revision => ({
    id: 1,
    collection: 'articles',
    item: 'article-123',
    data: { title: 'Original Title', content: 'Original Content' },
    delta: null,
    activity: {
      action: 'update',
      ip: '127.0.0.1',
      user_agent: 'Mozilla',
      origin: 'web',
      timestamp: '2024-01-01T00:00:00Z',
      user: 'user-1',
    },
    ...overrides,
  });

  describe('No Changes', () => {
    it('shows no changes message when revisions are identical', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: {},
      });
      const previousRevision = createRevision({ id: 1 });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
        />
      );

      expect(screen.getByText('No changes detected.')).toBeInTheDocument();
    });

    it('shows info alert about relational data', () => {
      const currentRevision = createRevision({ id: 2, delta: {} });
      const previousRevision = createRevision({ id: 1 });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
        />
      );

      expect(
        screen.getByText(/Changes made between published state and current state/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Relational data changes are not shown/)
      ).toBeInTheDocument();
    });
  });

  describe('Field Changes', () => {
    it('displays field name for changed fields', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: { title: 'New Title' },
      });
      const previousRevision = createRevision({
        id: 1,
        data: { title: 'Old Title' },
      });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
        />
      );

      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('shows old and new values for string changes', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: { title: 'New Title' },
      });
      const previousRevision = createRevision({
        id: 1,
        data: { title: 'Old Title', content: 'Some content' },
      });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
        />
      );

      expect(screen.getByText('Old Title')).toBeInTheDocument();
      expect(screen.getByText('New Title')).toBeInTheDocument();
    });

    it('uses custom field name from fields map', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: { title: 'New Title' },
      });
      const previousRevision = createRevision({
        id: 1,
        data: { title: 'Old Title' },
      });

      const fieldsMap = new Map([
        ['title', { name: 'Article Title' }],
      ]);

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
          fields={fieldsMap}
        />
      );

      expect(screen.getByText('Article Title')).toBeInTheDocument();
    });
  });

  describe('Multiple Fields', () => {
    it('displays all changed fields', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: { title: 'New Title', status: 'published' },
      });
      const previousRevision = createRevision({
        id: 1,
        data: { title: 'Old Title', status: 'draft' },
      });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
        />
      );

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('status')).toBeInTheDocument();
    });
  });

  describe('Concealed Fields', () => {
    it('shows updated indicator for concealed fields', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: { password: 'new-hash' },
      });
      const previousRevision = createRevision({
        id: 1,
        data: { password: 'new-hash' },
      });

      const fieldsMap = new Map([
        ['password', { name: 'Password', meta: { special: ['conceal'] } }],
      ]);

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
          fields={fieldsMap}
        />
      );

      expect(screen.getByText('Field value was updated (concealed)')).toBeInTheDocument();
    });
  });

  describe('No Previous Revision', () => {
    it('shows no changes when previous revision is missing', () => {
      const currentRevision = createRevision({
        id: 1,
        delta: { title: 'New Title' },
      });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision]}
        />
      );

      expect(screen.getByText('No changes detected.')).toBeInTheDocument();
    });
  });

  describe('Object and Array Values', () => {
    it('handles object value changes', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: { metadata: { key: 'new-value' } },
      });
      const previousRevision = createRevision({
        id: 1,
        data: { metadata: { key: 'old-value' } },
      });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
        />
      );

      expect(screen.getByText('metadata')).toBeInTheDocument();
    });

    it('handles array value changes', () => {
      const currentRevision = createRevision({
        id: 2,
        delta: { tags: ['tag1', 'tag2', 'tag3'] },
      });
      const previousRevision = createRevision({
        id: 1,
        data: { tags: ['tag1', 'tag2'] },
      });

      renderWithProvider(
        <RevisionsDrawerUpdates
          revision={currentRevision}
          revisions={[currentRevision, previousRevision]}
        />
      );

      expect(screen.getByText('tags')).toBeInTheDocument();
    });
  });
});
