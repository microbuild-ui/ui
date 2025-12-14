'use client';

import React from 'react';
import { Box, Text, Stack, Alert, Paper, Group, ActionIcon } from '@mantine/core';
import { IconAlertCircle, IconFolder, IconFile } from '@tabler/icons-react';

/**
 * Interface for file upload handling
 */
export interface FileUploadHandler {
  (files: File[]): Promise<string | string[] | null>;
}

/**
 * File interface props - placeholder for app-specific implementations
 */
export interface FileInterfaceProps {
  /** Current file value (UUID or file object) */
  value?: string | null;
  /** Callback when file changes */
  onChange?: (value: string | null) => void;
  /** Field label */
  label?: string;
  /** Field description */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Accepted file types */
  accept?: string;
  /** File upload handler (app-specific) */
  onUpload?: FileUploadHandler;
  /** Render function for file preview */
  renderPreview?: (fileId: string) => React.ReactNode;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * FileInterface Component (Placeholder)
 * 
 * This is a placeholder component for the file interface.
 * The actual implementation requires app-specific dependencies:
 * - File upload service
 * - File management API
 * - Storage integration
 * 
 * Apps should either:
 * 1. Extend this component with their own implementation
 * 2. Use this as a starting point and add the required services
 * 
 * @param props - FileInterface props
 */
export const FileInterface: React.FC<FileInterfaceProps> = ({
  value,
  onChange,
  label,
  description,
  error,
  disabled = false,
  required = false,
  accept,
  onUpload,
  renderPreview,
  'data-testid': testId,
}) => {
  // If no upload handler is provided, show a placeholder message
  if (!onUpload) {
    return (
      <Stack gap="xs" data-testid={testId}>
        {label && (
          <Text fw={500} size="sm">
            {label}
            {required && <Text component="span" c="red" ml={4}>*</Text>}
          </Text>
        )}
        {description && (
          <Text size="xs" c="dimmed">{description}</Text>
        )}
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          color="blue" 
          variant="light"
        >
          <Text size="sm">
            File interface requires an upload handler to be provided.
            Please implement the <code>onUpload</code> prop with your file upload service.
          </Text>
        </Alert>
        {error && (
          <Text size="xs" c="red">{error}</Text>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="xs" data-testid={testId}>
      {label && (
        <Text fw={500} size="sm">
          {label}
          {required && <Text component="span" c="red" ml={4}>*</Text>}
        </Text>
      )}
      {description && (
        <Text size="xs" c="dimmed">{description}</Text>
      )}
      
      <Paper withBorder p="md" radius="sm">
        {value ? (
          <Group>
            {renderPreview ? renderPreview(value) : (
              <Box
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--mantine-color-gray-1)',
                  borderRadius: 'var(--mantine-radius-sm)',
                }}
              >
                <IconFile size={20} />
              </Box>
            )}
            <Stack gap={0} style={{ flex: 1 }}>
              <Text size="sm" fw={500}>File uploaded</Text>
              <Text size="xs" c="dimmed">ID: {value}</Text>
            </Stack>
            {!disabled && (
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onChange?.(null)}
              >
                <IconFolder size={16} />
              </ActionIcon>
            )}
          </Group>
        ) : (
          <Group>
            <Box
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderRadius: 'var(--mantine-radius-sm)',
                border: '2px dashed var(--mantine-color-gray-4)',
              }}
            >
              <IconFolder size={20} color="var(--mantine-color-gray-6)" />
            </Box>
            <Text size="sm" c="dimmed">
              No file selected. Upload functionality requires app-specific implementation.
            </Text>
          </Group>
        )}
      </Paper>

      {error && (
        <Text size="xs" c="red">{error}</Text>
      )}
    </Stack>
  );
};

export default FileInterface;
