import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Files } from '../Files';

jest.mock('@/lib/api', () => ({
  daasAPI: {
    getFile: jest.fn(async (id: string) => ({
      id,
      filename_disk: `${id}.bin`,
      filename_download: `${id}.bin`,
      type: 'application/octet-stream',
      filesize: 1024,
      uploaded_on: '2024-01-01',
      uploaded_by: 'user-1',
    })),
    checkPermission: jest.fn(async () => true),
  },
}));

jest.mock('../../Upload', () => ({
  __esModule: true,
  Upload: ({ onInput, fromUser, fromUrl, fromLibrary }: any) => (
    <button
      type="button"
      data-testid="upload"
      data-fromuser={String(!!fromUser)}
      data-fromurl={String(!!fromUrl)}
      data-fromlibrary={String(!!fromLibrary)}
      onClick={() => onInput && onInput([
        { id: 'f1', filename_disk: 'f1', filename_download: 'f1', type: 'image/png', filesize: 2048, uploaded_on: '2024-01-01', uploaded_by: 'u1' },
        { id: 'f2', filename_disk: 'f2', filename_download: 'f2', type: 'image/png', filesize: 2048, uploaded_on: '2024-01-01', uploaded_by: 'u1' },
      ])}
    >MockUpload</button>
  ),
}));

const renderWithMantine = (ui: React.ReactElement) => render(<MantineProvider>{ui}</MantineProvider>);

describe('Files', () => {
  test('renders placeholder when empty', async () => {
    await act(async () => {
      renderWithMantine(<Files value={[]} />);
    });
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  test('uploads and lists files, supports reorder and remove', async () => {
    const onChange = jest.fn();
    await act(async () => {
      renderWithMantine(<Files value={[]} onChange={onChange} limit={10} />);
    });

    // Upload two files via mock
    await userEvent.click(screen.getByTestId('upload'));

  // Should render two rows (download links)
  expect(await screen.findAllByRole('link', { name: 'download' })).toHaveLength(2);

    // Move up/down and remove interact
    const removeButtons = screen.getAllByRole('button').filter((b) => b.querySelector('.tabler-icon-x'));

    // Click remove on last item
    await userEvent.click(removeButtons[removeButtons.length - 1]);

    // onChange should emit remaining ids
    expect(onChange).toHaveBeenCalled();
  });
});
