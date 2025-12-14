import React from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

export interface RichTextHTMLProps {
  /** Current value of the editor */
  value?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Toolbar configuration - array of toolbar items to show */
  toolbar?: string[];
  /** Custom folder for file uploads */
  folder?: string;
  /** Soft character length limit */
  softLength?: number;
  /** Whether to use minimal toolbar */
  minimal?: boolean;
  /** Editor font family */
  editorFont?: 'sans-serif' | 'serif' | 'monospace';
}

const defaultToolbar = [
  'bold',
  'italic',
  'underline',
  'h1',
  'h2',
  'h3',
  'numlist',
  'bullist',
  'removeformat',
  'blockquote',
  'customLink',
  'hr',
  'code',
];

export function RichTextHTML({
  value = '',
  onChange,
  label,
  placeholder = 'Start typing...',
  disabled = false,
  required = false,
  error,
  toolbar = defaultToolbar,
  folder: _folder, // Reserved for future file upload functionality
  softLength,
  minimal = false,
  editorFont = 'sans-serif',
}: RichTextHTMLProps) {
  // Font configuration
  const fontOptions = {
    'sans-serif': 'ui-sans-serif, system-ui, sans-serif',
    'serif': 'ui-serif, Georgia, serif',
    'monospace': 'ui-monospace, Menlo, monospace'
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Disable StarterKit's link to use Mantine's Link
      }),
      Highlight,
      Link,
      Superscript,
      SubScript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        style: `font-family: ${fontOptions[editorFont]}`,
      },
    },
  });

  // Update editor content when value prop changes
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  // Character count functionality
  const characterCount = editor?.getText()?.length || 0;
  const isNearLimit = softLength && characterCount > softLength * 0.8;
  const isOverLimit = softLength && characterCount > softLength;

  // Don't render until editor is ready
  if (!editor) {
    return (
      <div style={{ position: 'relative' }}>
        {label && (
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 500, 
            marginBottom: '8px',
            color: error ? 'var(--mantine-color-error)' : undefined
          }}>
            {label}
            {required && <span style={{ color: 'var(--mantine-color-error)' }}> *</span>}
          </div>
        )}
        <div style={{ 
          minHeight: '120px', 
          border: '1px solid var(--mantine-color-gray-4)',
          borderRadius: 'var(--mantine-radius-xs)', // SGDS border-radius-sm
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--mantine-color-gray-0)'
        }}>
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          marginBottom: '8px',
          color: error ? 'var(--mantine-color-error)' : undefined
        }}>
          {label}
          {required && <span style={{ color: 'var(--mantine-color-error)' }}> *</span>}
        </div>
      )}
      
      <RichTextEditor 
        editor={editor}
        style={{
          border: error ? '1px solid var(--mantine-color-error)' : undefined,
        }}
      >
        {!minimal && (
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              {toolbar.includes('bold') && <RichTextEditor.Bold />}
              {toolbar.includes('italic') && <RichTextEditor.Italic />}
              {toolbar.includes('underline') && <RichTextEditor.Underline />}
              {toolbar.includes('strikethrough') && <RichTextEditor.Strikethrough />}
              {toolbar.includes('removeformat') && <RichTextEditor.ClearFormatting />}
              {toolbar.includes('highlight') && <RichTextEditor.Highlight />}
              {toolbar.includes('code') && <RichTextEditor.Code />}
            </RichTextEditor.ControlsGroup>

            {(toolbar.includes('h1') || toolbar.includes('h2') || toolbar.includes('h3') || 
              toolbar.includes('h4') || toolbar.includes('h5') || toolbar.includes('h6')) && (
              <RichTextEditor.ControlsGroup>
                {toolbar.includes('h1') && <RichTextEditor.H1 />}
                {toolbar.includes('h2') && <RichTextEditor.H2 />}
                {toolbar.includes('h3') && <RichTextEditor.H3 />}
                {toolbar.includes('h4') && <RichTextEditor.H4 />}
                {toolbar.includes('h5') && <RichTextEditor.H5 />}
                {toolbar.includes('h6') && <RichTextEditor.H6 />}
              </RichTextEditor.ControlsGroup>
            )}

            {(toolbar.includes('blockquote') || toolbar.includes('hr') || toolbar.includes('bullist') || 
              toolbar.includes('numlist') || toolbar.includes('subscript') || toolbar.includes('superscript')) && (
              <RichTextEditor.ControlsGroup>
                {toolbar.includes('blockquote') && <RichTextEditor.Blockquote />}
                {toolbar.includes('hr') && <RichTextEditor.Hr />}
                {toolbar.includes('bullist') && <RichTextEditor.BulletList />}
                {toolbar.includes('numlist') && <RichTextEditor.OrderedList />}
                {toolbar.includes('subscript') && <RichTextEditor.Subscript />}
                {toolbar.includes('superscript') && <RichTextEditor.Superscript />}
              </RichTextEditor.ControlsGroup>
            )}

            {toolbar.includes('customLink') && (
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>
            )}

            {(toolbar.includes('alignleft') || toolbar.includes('aligncenter') || 
              toolbar.includes('alignright') || toolbar.includes('alignjustify')) && (
              <RichTextEditor.ControlsGroup>
                {toolbar.includes('alignleft') && <RichTextEditor.AlignLeft />}
                {toolbar.includes('aligncenter') && <RichTextEditor.AlignCenter />}
                {toolbar.includes('alignright') && <RichTextEditor.AlignRight />}
                {toolbar.includes('alignjustify') && <RichTextEditor.AlignJustify />}
              </RichTextEditor.ControlsGroup>
            )}

            {(toolbar.includes('undo') || toolbar.includes('redo')) && (
              <RichTextEditor.ControlsGroup>
                {toolbar.includes('undo') && <RichTextEditor.Undo />}
                {toolbar.includes('redo') && <RichTextEditor.Redo />}
              </RichTextEditor.ControlsGroup>
            )}
          </RichTextEditor.Toolbar>
        )}

        <RichTextEditor.Content />
        
        {softLength && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              fontSize: '12px',
              color: isOverLimit ? 'var(--mantine-color-red-6)' : 
                     isNearLimit ? 'var(--mantine-color-orange-6)' : 
                     'var(--mantine-color-gray-6)',
              pointerEvents: 'none',
            }}
          >
            {softLength - characterCount}
          </div>
        )}
      </RichTextEditor>
      
      {error && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--mantine-color-error)',
            marginTop: '4px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
