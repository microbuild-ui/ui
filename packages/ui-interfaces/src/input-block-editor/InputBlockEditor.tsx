/**
 * InputBlockEditor Interface Component
 * Block-based content editor using EditorJS
 * 
 * Based on Directus input-block-editor interface
 * Uses EditorJS for visual block-based editing
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Text, Paper } from '@mantine/core';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import NestedList from '@editorjs/nested-list';
import Paragraph from '@editorjs/paragraph';
import Code from '@editorjs/code';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Underline from '@editorjs/underline';
import InlineCode from '@editorjs/inline-code';

export interface InputBlockEditorProps {
  /** Current value as EditorJS OutputData or null */
  value?: OutputData | Record<string, unknown> | null;
  /** Change handler */
  onChange?: (value: OutputData | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Font family */
  font?: 'sans-serif' | 'monospace' | 'serif';
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Field label */
  label?: string;
  /** Field description */
  description?: string;
  /** Error message */
  error?: string;
  /** Available tools */
  tools?: string[];
}

// Default tools like Directus
const DEFAULT_TOOLS = ['header', 'nestedlist', 'code', 'paragraph', 'checklist', 'quote', 'underline'];

export function InputBlockEditor({
  value,
  onChange,
  placeholder = 'Start writing or press Tab to add a block...',
  font = 'sans-serif',
  disabled = false,
  readOnly = false,
  required = false,
  label,
  description,
  error,
  tools: toolSelection = DEFAULT_TOOLS,
}: InputBlockEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const isInitializing = useRef(false);
  const valueChangedInternally = useRef(false);

  // Get tools configuration based on selection
  const getTools = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTools: Record<string, any> = {
      header: {
        class: Header,
        inlineToolbar: true,
        config: {
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 2,
        },
      },
      nestedlist: {
        class: NestedList,
        inlineToolbar: true,
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      code: {
        class: Code,
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },
      delimiter: {
        class: Delimiter,
      },
      table: {
        class: Table,
        inlineToolbar: true,
      },
      underline: {
        class: Underline,
      },
      inlinecode: {
        class: InlineCode,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedTools: Record<string, any> = {};
    for (const toolName of toolSelection) {
      if (toolName in allTools) {
        selectedTools[toolName] = allTools[toolName];
      }
    }
    return selectedTools;
  }, [toolSelection]);

  // Sanitize value to EditorJS format
  const sanitizeValue = useCallback((val: unknown): OutputData | undefined => {
    if (!val || typeof val !== 'object') return undefined;
    
    const data = val as Record<string, unknown>;
    if (!data.blocks || !Array.isArray(data.blocks) || data.blocks.length < 1) {
      return undefined;
    }

    return {
      time: (data.time as number) || Date.now(),
      version: (data.version as string) || '2.31.0',
      blocks: data.blocks as OutputData['blocks'],
    };
  }, []);

  // Initialize EditorJS
  useEffect(() => {
    if (!holderRef.current || isInitializing.current || editorRef.current) return;

    isInitializing.current = true;

    const initEditor = async () => {
      try {
        const editor = new EditorJS({
          holder: holderRef.current!,
          placeholder,
          readOnly: disabled || readOnly,
          minHeight: 100,
          tools: getTools(),
          data: sanitizeValue(value),
          onChange: async (api) => {
            if (disabled || readOnly || !onChange) return;
            
            try {
              const outputData = await api.saver.save();
              valueChangedInternally.current = true;
              
              if (!outputData || outputData.blocks.length < 1) {
                onChange(null);
              } else {
                onChange(outputData);
              }
            } catch (err) {
              console.error('EditorJS save error:', err);
            }
          },
        });

        await editor.isReady;
        editorRef.current = editor;
        setIsReady(true);
      } catch (err) {
        console.error('EditorJS init error:', err);
      } finally {
        isInitializing.current = false;
      }
    };

    initEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
        setIsReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update editor when value changes externally
  useEffect(() => {
    if (!isReady || !editorRef.current || valueChangedInternally.current) {
      valueChangedInternally.current = false;
      return;
    }

    const sanitized = sanitizeValue(value);
    if (sanitized) {
      editorRef.current.render(sanitized);
    } else {
      editorRef.current.clear();
    }
  }, [value, isReady, sanitizeValue]);

  // Update readOnly state
  useEffect(() => {
    if (!isReady || !editorRef.current) return;
    editorRef.current.readOnly.toggle(disabled || readOnly);
  }, [disabled, readOnly, isReady]);

  // Font family styles
  const fontFamily = {
    'sans-serif': 'var(--mantine-font-family)',
    'monospace': 'var(--mantine-font-family-monospace)',
    'serif': 'Georgia, serif',
  }[font];

  return (
    <Box>
      {label && (
        <Text size="sm" fw={500} mb={4}>
          {label}
          {required && <span style={{ color: 'var(--mantine-color-red-6)' }}> *</span>}
        </Text>
      )}
      {description && (
        <Text size="xs" c="dimmed" mb={8}>
          {description}
        </Text>
      )}
      <Paper
        withBorder
        p="md"
        style={{
          fontFamily,
          minHeight: 150,
          backgroundColor: disabled ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-white)',
          borderColor: error ? 'var(--mantine-color-red-6)' : undefined,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      >
        <div 
          ref={holderRef} 
          className="editor-js-holder"
          style={{ minHeight: 100 }}
        />
      </Paper>
      {error && (
        <Text size="xs" c="red" mt={4}>
          {error}
        </Text>
      )}
    </Box>
  );
}

export default InputBlockEditor;
