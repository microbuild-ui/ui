import type { Meta, StoryObj } from '@storybook/react';
import { Upload } from './Upload';

const meta: Meta<typeof Upload> = {
  title: 'Interfaces/Upload',
  component: Upload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A versatile upload component supporting file upload from device, URL import, and library selection.

## Features
- Upload from device (drag & drop or file picker)
- Import from URL
- Select from file library
- Multiple file support
- File type filtering
- Folder targeting
- Upload presets

## Usage
\`\`\`tsx
import { Upload } from '@microbuild/ui-interfaces';

<Upload
  onInput={(files) => console.log('Uploaded:', files)}
  fromUser
  fromUrl
  fromLibrary
  accept="image/*"
/>
\`\`\`

**Note:** This component requires callback functions for actual file operations.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file uploads',
    },
    fromUser: {
      control: 'boolean',
      description: 'Enable upload from device',
    },
    fromUrl: {
      control: 'boolean',
      description: 'Enable import from URL',
    },
    fromLibrary: {
      control: 'boolean',
      description: 'Enable selection from library',
    },
    autoOpenLibrary: {
      control: 'boolean',
      description: 'Auto-open library browser when component mounts',
    },
    folder: {
      control: 'text',
      description: 'Target folder for uploads',
    },
    accept: {
      control: 'text',
      description: 'Accepted file types',
    },
    preset: {
      control: 'text',
      description: 'Upload preset',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
  },
};

export const SingleFileUpload: Story = {
  args: {
    multiple: false,
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
  },
};

export const MultipleFileUpload: Story = {
  args: {
    multiple: true,
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
  },
};

export const DeviceUploadOnly: Story = {
  args: {
    fromUser: true,
    fromUrl: false,
    fromLibrary: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Only allows uploading from device.',
      },
    },
  },
};

export const URLImportOnly: Story = {
  args: {
    fromUser: false,
    fromUrl: true,
    fromLibrary: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Only allows importing from URL.',
      },
    },
  },
};

export const LibraryOnly: Story = {
  args: {
    fromUser: false,
    fromUrl: false,
    fromLibrary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Only allows selecting from library.',
      },
    },
  },
};

export const ImagesOnly: Story = {
  args: {
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
    accept: 'image/*',
  },
  parameters: {
    docs: {
      description: {
        story: 'Restricts uploads to image files.',
      },
    },
  },
};

export const DocumentsOnly: Story = {
  args: {
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
  },
  parameters: {
    docs: {
      description: {
        story: 'Restricts uploads to document files.',
      },
    },
  },
};

export const VideoFiles: Story = {
  args: {
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
    accept: 'video/*',
  },
  parameters: {
    docs: {
      description: {
        story: 'Restricts uploads to video files.',
      },
    },
  },
};

export const WithTargetFolder: Story = {
  args: {
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
    folder: 'uploads/2024',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uploads go to a specific folder.',
      },
    },
  },
};

export const WithPreset: Story = {
  args: {
    fromUser: true,
    fromLibrary: true,
    preset: 'thumbnail',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses a predefined upload preset for processing.',
      },
    },
  },
};

export const AutoOpenLibrary: Story = {
  args: {
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
    autoOpenLibrary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Automatically opens the library browser on mount.',
      },
    },
  },
};

export const ProfilePicture: Story = {
  args: {
    multiple: false,
    fromUser: true,
    fromLibrary: true,
    accept: 'image/jpeg,image/png,image/webp',
    folder: 'avatars',
  },
  parameters: {
    docs: {
      description: {
        story: 'Typical configuration for profile picture uploads.',
      },
    },
  },
};

export const AttachmentUpload: Story = {
  args: {
    multiple: true,
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip',
    folder: 'attachments',
  },
  parameters: {
    docs: {
      description: {
        story: 'Configuration for general document attachments.',
      },
    },
  },
};

export const MediaGallery: Story = {
  args: {
    multiple: true,
    fromUser: true,
    fromUrl: true,
    fromLibrary: true,
    accept: 'image/*,video/*',
    folder: 'media',
  },
  parameters: {
    docs: {
      description: {
        story: 'Configuration for media gallery uploads.',
      },
    },
  },
};
