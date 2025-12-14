'use client';

import React, { forwardRef, useRef, useState, useMemo } from 'react';
import { Box, Text, Paper, Tooltip, Button } from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';

export interface InputCodeProps extends Omit<React.ComponentPropsWithRef<'textarea'>, 'onChange' | 'value'> {
  /** Current value of the code input */
  value?: string | null;
  /** Callback when value changes */
  onChange?: (value: string | null) => void;
  /** Field label */
  label?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Whether to show line numbers */
  lineNumber?: boolean;
  /** Whether to wrap long lines */
  lineWrapping?: boolean;
  /** Template content to fill */
  template?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * InputCode Interface Component
 * 
 * A code input interface that matches the Directus input-code interface functionality.
 * Provides a monospace textarea with optional line numbers and template support.
 * 
 * Features:
 * - Monospace font for code editing
 * - Optional line numbers
 * - Line wrapping toggle
 * - Template fill functionality
 * - Language indicator
 * - JSON and plaintext support
 * 
 * @param props - InputCode interface props
 * @returns React component
 * 
 * @example
 * ```tsx
 * <InputCode
 *   label="Configuration"
 *   value={jsonString}
 *   onChange={(value) => console.log(value)}
 *   language="json"
 *   lineNumber
 * />
 * ```
 */
export const InputCode = forwardRef<HTMLTextAreaElement, InputCodeProps>(({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  placeholder = 'Enter code...',
  error,
  language = 'plaintext',
  lineNumber = true,
  lineWrapping = true,
  template,
  'data-testid': testId,
  ...props
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(value || '');

  // Map language prop to internal language
  const _language = useMemo(() => {
    if (!language) return 'plaintext';
    return language.toLowerCase();
  }, [language]);

  // Calculate line numbers
  const lineNumbers = useMemo(() => {
    const lines = (internalValue || '').split('\n');
    return Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);
  }, [internalValue]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    onChange?.(newValue || null);
  };

  const fillTemplate = () => {
    if (template && !disabled) {
      setInternalValue(template);
      onChange?.(template);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    // Sync line numbers scroll with textarea
    const lineNumbersEl = event.currentTarget.parentElement?.querySelector('[data-line-numbers]');
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = event.currentTarget.scrollTop;
    }
  };

  return (
    <Box style={{ position: 'relative' }} data-testid={testId}>
      {label && (
        <Text fw={500} size="sm" mb="xs">
          {label}
          {required && <Text component="span" c="red" ml={4}>*</Text>}
        </Text>
      )}

      <Paper
        withBorder
        radius="sm"
        style={{
          overflow: 'hidden',
          borderColor: error ? 'var(--mantine-color-red-filled)' : undefined,
        }}
      >
        <Box style={{ display: 'flex', minHeight: '120px' }}>
          {/* Line numbers */}
          {lineNumber && (
            <Box
              data-line-numbers
              style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
                borderRight: '1px solid var(--mantine-color-gray-3)',
                padding: '8px 12px 8px 8px',
                fontSize: '14px',
                lineHeight: '20px',
                color: 'var(--mantine-color-gray-6)',
                userSelect: 'none',
                textAlign: 'right',
                minWidth: '40px',
                fontFamily: 'var(--mantine-font-family-monospace)',
                overflow: 'hidden',
                maxHeight: '100%',
              }}
            >
              {lineNumbers.map(lineNum => (
                <Box key={lineNum} style={{ height: '20px' }}>
                  {lineNum}
                </Box>
              ))}
            </Box>
          )}

          {/* Code editor textarea */}
          <Box style={{ flex: 1, position: 'relative' }}>
            <Box
              component="textarea"
              ref={ref || textareaRef}
              value={internalValue}
              onChange={handleChange}
              onScroll={handleScroll}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: '120px',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                padding: '8px 12px',
                fontSize: '14px',
                lineHeight: '20px',
                fontFamily: 'var(--mantine-font-family-monospace)',
                backgroundColor: 'transparent',
                whiteSpace: lineWrapping ? 'pre-wrap' : 'pre',
                overflow: 'auto',
                color: disabled ? 'var(--mantine-color-gray-6)' : 'inherit',
                tabSize: 4,
              }}
              {...props}
            />

            {/* Template fill button */}
            {template && (
              <Tooltip label="Fill Template" position="left">
                <Button
                  variant="subtle"
                  size="xs"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 4,
                  }}
                  onClick={fillTemplate}
                  disabled={disabled}
                >
                  <IconPlaylistAdd size={16} />
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Paper>

      {error && (
        <Box mt={4} fz="xs" c="red">
          {error}
        </Box>
      )}

      {/* Language indicator */}
      {_language && _language !== 'plaintext' && (
        <Box
          style={{
            position: 'absolute',
            right: 0,
            bottom: '-20px',
            fontSize: '12px',
            fontStyle: 'italic',
            color: 'var(--mantine-color-gray-6)',
            textAlign: 'right',
          }}
        >
          {_language.toUpperCase()}
        </Box>
      )}
    </Box>
  );
});

InputCode.displayName = 'InputCode';

export default InputCode;
