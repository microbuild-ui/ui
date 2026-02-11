import type { Meta, StoryObj } from '@storybook/react';
import { File } from './File';

const meta: Meta<typeof File> = {
  title: 'Interfaces/File',
  component: File,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A file upload interface component that matches Directus file interface functionality. Supports single and multiple file uploads, drag & drop, file type validation, and preview capabilities.',
      },
    },
  },
  argTypes: {
    value: {
      description: 'Current file value - can be a file ID, file object, or array of files',
      control: { type: 'object' },
    },
    multiple: {
      description: 'Allow multiple file uploads',
      control: { type: 'boolean' },
    },
    accept: {
      description: 'Accept specific file types (e.g., "image/*", ".pdf,.doc,.docx")',
      control: { type: 'text' },
    },
    maxSize: {
      description: 'Maximum file size in bytes',
      control: { type: 'number' },
    },
    maxFiles: {
      description: 'Maximum number of files (for multiple)',
      control: { type: 'number' },
    },
    display: {
      description: 'Display mode',
      control: { type: 'select' },
      options: ['list', 'grid', 'preview'],
    },
    disabled: {
      description: 'Whether the field is disabled',
      control: { type: 'boolean' },
    },
    required: {
      description: 'Whether the field is required',
      control: { type: 'boolean' },
    },
    showDetails: {
      description: 'Show file details (size, dimensions)',
      control: { type: 'boolean' },
    },
    enableCreate: {
      description: 'Enable create/upload functionality',
      control: { type: 'boolean' },
    },
    enableSelect: {
      description: 'Enable select from existing files',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof File>;

export const Default: Story = {
  args: {
    label: 'File Upload',
    placeholder: 'Select a file',
    required: false,
    disabled: false,
    multiple: false,
    showDetails: true,
    enableCreate: true,
    enableSelect: true,
    display: 'list',
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

export const Multiple: Story = {
  args: {
    label: 'Multiple Files',
    placeholder: 'Select multiple files',
    multiple: true,
    maxFiles: 5,
    showDetails: true,
    display: 'list',
    maxSize: 10 * 1024 * 1024,
  },
};

export const ImagesOnly: Story = {
  args: {
    label: 'Image Upload',
    placeholder: 'Select images',
    accept: 'image/*',
    multiple: true,
    maxFiles: 10,
    display: 'preview',
    showDetails: true,
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

export const DocumentsOnly: Story = {
  args: {
    label: 'Document Upload',
    placeholder: 'Select documents',
    accept: '.pdf,.doc,.docx,.txt',
    multiple: true,
    maxFiles: 3,
    display: 'list',
    showDetails: true,
    maxSize: 20 * 1024 * 1024, // 20MB
  },
};

export const GridDisplay: Story = {
  args: {
    label: 'File Grid',
    placeholder: 'Select files',
    multiple: true,
    maxFiles: 8,
    display: 'grid',
    showDetails: true,
    maxSize: 10 * 1024 * 1024,
  },
};

export const SingleRequired: Story = {
  args: {
    label: 'Required File',
    placeholder: 'Please select a file',
    required: true,
    showDetails: true,
    maxSize: 10 * 1024 * 1024,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Upload',
    placeholder: 'File upload disabled',
    disabled: true,
    value: {
      id: 'file_1',
      filename_download: 'example-document.pdf',
      filename_disk: 'example-document.pdf',
      type: 'application/pdf',
      filesize: 1024000,
      uploaded_on: new Date().toISOString(),
      uploaded_by: 'user',
    },
    showDetails: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'File Upload',
    placeholder: 'Select a file',
    required: true,
    error: 'Please select a file',
    showDetails: true,
    maxSize: 10 * 1024 * 1024,
  },
};

export const UploadOnly: Story = {
  args: {
    label: 'Upload Only',
    placeholder: 'Upload new files only',
    enableCreate: true,
    enableSelect: false,
    multiple: true,
    maxFiles: 5,
    showDetails: true,
    maxSize: 10 * 1024 * 1024,
  },
};

export const SelectOnly: Story = {
  args: {
    label: 'Select Existing',
    placeholder: 'Select from existing files only',
    enableCreate: false,
    enableSelect: true,
    multiple: true,
    maxFiles: 3,
    showDetails: true,
  },
};

// Story with pre-populated files to show the display
export const WithFiles: Story = {
  args: {
    label: 'Files Already Selected',
    multiple: true,
    value: [
      {
        id: 'file_1',
        filename_download: 'document.pdf',
        filename_disk: 'document.pdf',
        type: 'application/pdf',
        filesize: 1024000,
        uploaded_on: new Date().toISOString(),
        uploaded_by: 'user',
      },
      {
        id: 'file_2',
        filename_download: 'image.jpg',
        filename_disk: 'image.jpg',
        type: 'image/jpeg',
        filesize: 2048000,
        width: 1920,
        height: 1080,
        uploaded_on: new Date().toISOString(),
        uploaded_by: 'user',
      },
      {
        id: 'file_3',
        filename_download: 'spreadsheet.xlsx',
        filename_disk: 'spreadsheet.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filesize: 512000,
        uploaded_on: new Date().toISOString(),
        uploaded_by: 'user',
      },
    ],
    showDetails: true,
    display: 'list',
    maxSize: 10 * 1024 * 1024,
  },
};

export const WithImagesPreview: Story = {
  args: {
    label: 'Image Preview',
    multiple: true,
    value: [
      {
        id: 'img_1',
        filename_download: 'landscape.jpg',
        filename_disk: 'landscape.jpg',
        type: 'image/jpeg',
        filesize: 2048000,
        width: 1920,
        height: 1080,
        uploaded_on: new Date().toISOString(),
        uploaded_by: 'user',
      },
      {
        id: 'img_2',
        filename_download: 'portrait.png',
        filename_disk: 'portrait.png',
        type: 'image/png',
        filesize: 3072000,
        width: 1080,
        height: 1920,
        uploaded_on: new Date().toISOString(),
        uploaded_by: 'user',
      },
    ],
    accept: 'image/*',
    showDetails: true,
    display: 'preview',
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024,
  },
};
