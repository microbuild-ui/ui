import type { Meta, StoryObj } from '@storybook/react';
import { FileImage } from './FileImage';

const meta: Meta<typeof FileImage> = {
  title: 'Interfaces/FileImage',
  component: FileImage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `An image-specific file picker with lightbox preview, upload modal, and metadata editing.

## Features
- Image preview with zoom
- Upload new images
- Select from file library
- Metadata editing (title, description)
- Crop/contain display modes
- Letterbox effect option
- Download functionality

## Usage
\`\`\`tsx
import { FileImage } from '@buildpad/ui-interfaces';

<FileImage
  label="Profile Picture"
  value={imageId}
  onChange={(value) => setImageId(value)}
  enableCreate
  enableSelect
/>
\`\`\`

**Note:** This component requires a configured API connection to work with real files.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value (file ID or file object)',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled',
    },
    readonly: {
      control: 'boolean',
      description: 'Whether the picker is read-only',
    },
    crop: {
      control: 'boolean',
      description: 'Whether preview should crop (cover) or contain',
    },
    letterbox: {
      control: 'boolean',
      description: 'Add padding around image for letterbox effect',
    },
    width: {
      control: 'select',
      options: ['auto', 'full', 'fill', 'half'],
      description: 'Width mode',
    },
    enableCreate: {
      control: 'boolean',
      description: 'Enable upload new images',
    },
    enableSelect: {
      control: 'boolean',
      description: 'Enable selecting from library',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Image',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Profile Picture',
    placeholder: 'Upload or select an image',
  },
};

export const EnableUploadOnly: Story = {
  args: {
    label: 'Upload Image',
    enableCreate: true,
    enableSelect: false,
  },
};

export const EnableSelectOnly: Story = {
  args: {
    label: 'Select Image',
    enableCreate: false,
    enableSelect: true,
  },
};

export const BothEnabled: Story = {
  args: {
    label: 'Image',
    enableCreate: true,
    enableSelect: true,
    placeholder: 'Upload or select from library',
  },
};

export const CropMode: Story = {
  args: {
    label: 'Cover Image',
    crop: true,
    placeholder: 'Image will be cropped to fit',
  },
};

export const ContainMode: Story = {
  args: {
    label: 'Logo',
    crop: false,
    placeholder: 'Image will be contained',
  },
};

export const Letterbox: Story = {
  args: {
    label: 'Thumbnail',
    letterbox: true,
    placeholder: 'With letterbox padding',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Banner',
    width: 'full',
  },
};

export const HalfWidth: Story = {
  args: {
    label: 'Side Image',
    width: 'half',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Image',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    readonly: true,
  },
};

export const WithMockImage: Story = {
  args: {
    label: 'Profile Picture',
    value: {
      id: 'mock-image-1',
      filename_download: 'profile.jpg',
      filename_disk: 'profile.jpg',
      type: 'image/jpeg',
      filesize: 150000,
      width: 400,
      height: 400,
      title: 'Profile Photo',
      description: 'User profile picture',
      uploaded_on: '2024-01-15T10:30:00Z',
      uploaded_by: 'user-1',
    },
    enableCreate: true,
    enableSelect: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with a mock file object showing the component structure.',
      },
    },
  },
};

export const ProductImage: Story = {
  args: {
    label: 'Product Image',
    placeholder: 'Add product image',
    enableCreate: true,
    enableSelect: true,
    crop: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Common use case for e-commerce product images.',
      },
    },
  },
};

export const AvatarUpload: Story = {
  args: {
    label: 'Avatar',
    width: 'half',
    crop: true,
    enableCreate: true,
    enableSelect: false,
    placeholder: 'Upload your avatar',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact avatar upload with crop mode.',
      },
    },
  },
};
