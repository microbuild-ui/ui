import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { GroupRaw } from '../group-raw/GroupRaw';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('GroupRaw', () => {
  it('renders with default props', () => {
    renderWithProvider(<GroupRaw />);
    expect(document.querySelector('.group-raw')).toBeInTheDocument();
  });

  it('renders children directly without visual wrapper', () => {
    renderWithProvider(
      <GroupRaw>
        <div data-testid="child-content">Hello</div>
      </GroupRaw>
    );
    expect(screen.getByTestId('child-content')).toBeVisible();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders multiple children inline', () => {
    renderWithProvider(
      <GroupRaw>
        <div data-testid="field-1">Field 1</div>
        <div data-testid="field-2">Field 2</div>
        <div data-testid="field-3">Field 3</div>
      </GroupRaw>
    );
    expect(screen.getByTestId('field-1')).toBeVisible();
    expect(screen.getByTestId('field-2')).toBeVisible();
    expect(screen.getByTestId('field-3')).toBeVisible();
  });

  it('passes through without collapsible behavior', () => {
    renderWithProvider(
      <GroupRaw
        field={{ name: 'Raw Group', meta: { field: 'raw_group' } }}
        disabled
      >
        <div data-testid="always-visible">Always visible content</div>
      </GroupRaw>
    );
    // Content should always be visible regardless of disabled state
    expect(screen.getByTestId('always-visible')).toBeVisible();
  });
});
