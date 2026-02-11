import type { Meta, StoryObj } from '@storybook/react';
import { ListM2M } from './ListM2M';

const meta: Meta<typeof ListM2M> = {
    title: 'Interfaces/ListM2M',
    component: ListM2M,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
The ListM2M interface manages many-to-many relationships through junction tables,
providing a comprehensive UI for creating, selecting, editing, and removing related items.

## Features
- **Dual Layout Modes**: List view with templates and Table view with columns
- **CRUD Operations**: Create new items, select existing items, edit relationships, remove items
- **Search & Filter**: Built-in search functionality for table layout
- **Manual Sorting**: Up/down buttons for reordering when sort field exists
- **Pagination**: Handle large datasets with configurable page size
- **Customizable Display**: Templates for list view, field selection for table view
- **Integration**: Uses CollectionList for selection and CollectionForm for editing

## Use Cases
- Article tags management
- User-project assignments
- Product categories
- Permission roles
- Content relationships
                `
            }
        }
    },
    argTypes: {
        layout: {
            control: 'select',
            options: ['list', 'table'],
            description: 'Layout mode - list or table view'
        },
        tableSpacing: {
            control: 'select',
            options: ['compact', 'cozy', 'comfortable'],
            description: 'Table row spacing (only for table layout)'
        },
        enableCreate: {
            control: 'boolean',
            description: 'Show create new item button'
        },
        enableSelect: {
            control: 'boolean',
            description: 'Show select existing items button'
        },
        enableSearchFilter: {
            control: 'boolean',
            description: 'Show search input (table layout only)'
        },
        enableLink: {
            control: 'boolean',
            description: 'Show links to related items'
        },
        disabled: {
            control: 'boolean',
            description: 'Disable the interface'
        },
        required: {
            control: 'boolean',
            description: 'Mark as required field'
        },
        allowDuplicates: {
            control: 'boolean',
            description: 'Allow duplicate selections'
        },
        limit: {
            control: 'number',
            description: 'Items per page',
            min: 5,
            max: 100
        }
    }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for stories
const mockArticleTags = [
    {
        id: 1,
        article_id: 1,
        tag_id: { id: 1, name: "React", color: "#61DAFB", slug: "react" },
        created_at: "2024-01-15T10:30:00Z"
    },
    {
        id: 2,
        article_id: 1,
        tag_id: { id: 2, name: "TypeScript", color: "#3178C6", slug: "typescript" },
        created_at: "2024-01-15T10:31:00Z"
    },
    {
        id: 3,
        article_id: 1,
        tag_id: { id: 3, name: "Mantine", color: "#339AF0", slug: "mantine" },
        created_at: "2024-01-15T10:32:00Z"
    }
];

const mockProjectMembers = [
    {
        id: 1,
        project_id: 1,
        user_id: { 
            id: 1, 
            name: "John Doe", 
            email: "john@example.com", 
            role: "Developer",
            avatar: null
        },
        role: "Lead Developer",
        permissions: ["read", "write", "admin"],
        joined_at: "2024-01-01T00:00:00Z"
    },
    {
        id: 2,
        project_id: 1,
        user_id: { 
            id: 2, 
            name: "Jane Smith", 
            email: "jane@example.com", 
            role: "Designer",
            avatar: null
        },
        role: "UI Designer",
        permissions: ["read", "write"],
        joined_at: "2024-01-02T00:00:00Z"
    },
    {
        id: 3,
        project_id: 1,
        user_id: { 
            id: 3, 
            name: "Bob Wilson", 
            email: "bob@example.com", 
            role: "Manager",
            avatar: null
        },
        role: "Project Manager",
        permissions: ["read", "write", "admin"],
        joined_at: "2024-01-03T00:00:00Z"
    }
];

/**
 * Default List M2M interface in list layout mode
 */
export const Default: Story = {
    args: {
        value: mockArticleTags,
        collection: 'articles',
        field: 'tags',
        primaryKey: 1,
        layout: 'list',
        template: '{{tag_id.name}} ({{tag_id.color}})',
        enableCreate: true,
        enableSelect: true,
        enableLink: false,
        disabled: false,
        label: 'Article Tags',
        description: 'Tags associated with this article',
        limit: 15,
        onChange: (_value: any) => {
            // Value changed callback
        }
    }
};

/**
 * Table layout with multiple columns and search functionality
 */
export const TableLayout: Story = {
    args: {
        value: mockProjectMembers,
        collection: 'projects',
        field: 'members',
        primaryKey: 1,
        layout: 'table',
        fields: ['user_id.name', 'user_id.email', 'role', 'joined_at'],
        enableCreate: true,
        enableSelect: true,
        enableSearchFilter: true,
        enableLink: true,
        disabled: false,
        label: 'Project Members',
        description: 'Users assigned to this project',
        tableSpacing: 'cozy',
        limit: 15,
        onChange: (_value: any) => {
            // Table value changed callback
        }
    }
};

/**
 * Compact table layout with minimal spacing
 */
export const CompactTable: Story = {
    args: {
        ...TableLayout.args,
        tableSpacing: 'compact',
        label: 'Compact Project Members',
        description: 'Compact table layout with minimal row spacing'
    }
};

/**
 * Comfortable table layout with more spacing
 */
export const ComfortableTable: Story = {
    args: {
        ...TableLayout.args,
        tableSpacing: 'comfortable',
        label: 'Comfortable Project Members',
        description: 'Comfortable table layout with generous row spacing'
    }
};

/**
 * Disabled state - read-only interface
 */
export const Disabled: Story = {
    args: {
        value: mockArticleTags,
        collection: 'articles',
        field: 'tags',
        primaryKey: 1,
        layout: 'list',
        template: '{{tag_id.name}}',
        disabled: true,
        label: 'Read-only Tags',
        description: 'These tags cannot be modified',
        enableCreate: false,
        enableSelect: false,
        onChange: (_value: any) => {
            // Value changed (disabled) callback
        }
    }
};

/**
 * Empty state with no items
 */
export const Empty: Story = {
    args: {
        value: [],
        collection: 'articles',
        field: 'categories',
        primaryKey: 1,
        layout: 'list',
        enableCreate: true,
        enableSelect: true,
        label: 'Article Categories',
        description: 'No categories assigned yet',
        onChange: (_value: any) => {
            // Empty value changed callback
        }
    }
};

/**
 * Required field with validation
 */
export const Required: Story = {
    args: {
        value: [],
        collection: 'articles',
        field: 'categories',
        primaryKey: 1,
        layout: 'list',
        enableCreate: true,
        enableSelect: true,
        required: true,
        label: 'Required Categories',
        description: 'At least one category must be selected',
        error: 'This field is required',
        onChange: (_value: any) => {
            // Required value changed callback
        }
    }
};

/**
 * Minimal configuration with defaults
 */
export const Minimal: Story = {
    args: {
        value: [],
        collection: 'posts',
        field: 'tags',
        primaryKey: 1,
        onChange: (_value: any) => {
            // Minimal value changed callback
        }
    }
};

/**
 * With custom template formatting
 */
export const CustomTemplate: Story = {
    args: {
        value: mockArticleTags,
        collection: 'articles',
        field: 'tags',
        primaryKey: 1,
        layout: 'list',
        template: '🏷️ {{tag_id.name}} | {{tag_id.slug}} | {{tag_id.color}}',
        enableCreate: true,
        enableSelect: true,
        label: 'Tags with Custom Template',
        description: 'Using custom template with emojis and multiple fields',
        onChange: (_value: any) => {
            // Custom template value changed callback
        }
    }
};

/**
 * Large dataset with pagination
 */
export const WithPagination: Story = {
    args: {
        value: [
            ...mockProjectMembers,
            ...Array.from({ length: 20 }, (_, i) => ({
                id: i + 10,
                project_id: 1,
                user_id: { 
                    id: i + 10, 
                    name: `User ${i + 4}`, 
                    email: `user${i + 4}@example.com`, 
                    role: "Contributor"
                },
                role: "Contributor",
                permissions: ["read"],
                joined_at: `2024-01-${String(i + 4).padStart(2, '0')}T00:00:00Z`
            }))
        ],
        collection: 'projects',
        field: 'members',
        primaryKey: 1,
        layout: 'table',
        fields: ['user_id.name', 'user_id.email', 'role'],
        enableSearchFilter: true,
        label: 'Large Member List',
        description: 'Demonstrating pagination with many items',
        limit: 10,
        onChange: (_value: any) => {
            // Paginated value changed callback
        }
    }
};

/**
 * Error state
 */
export const WithError: Story = {
    args: {
        value: mockArticleTags,
        collection: 'articles',
        field: 'tags',
        primaryKey: 1,
        layout: 'list',
        template: '{{tag_id.name}}',
        label: 'Tags with Error',
        description: 'This field has a validation error',
        error: 'Invalid tag selection - duplicates not allowed',
        required: true,
        onChange: (_value: any) => {
            // Error state value changed callback
        }
    }
};

/**
 * All features enabled
 */
export const FullFeatured: Story = {
    args: {
        value: mockProjectMembers,
        collection: 'projects',
        field: 'members',
        primaryKey: 1,
        layout: 'table',
        fields: ['user_id.name', 'user_id.email', 'role', 'permissions', 'joined_at'],
        enableCreate: true,
        enableSelect: true,
        enableSearchFilter: true,
        enableLink: true,
        tableSpacing: 'cozy',
        label: 'Full Featured Project Members',
        description: 'All features enabled - create, select, search, link, sort',
        required: false,
        allowDuplicates: false,
        limit: 15,
        onChange: (_value: any) => {
            // Full featured value changed callback
        }
    }
};
