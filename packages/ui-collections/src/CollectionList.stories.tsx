// @ts-nocheck
import { Code, Paper, Stack, Text } from "@mantine/core";
import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { CollectionList } from "./CollectionList";

// ============================================================================
// Mock Data — stories work offline without a DaaS backend
// ============================================================================

const MOCK_FIELDS = [
  {
    field: "id",
    type: "integer",
    collection: "posts",
    meta: {
      id: 1,
      collection: "posts",
      field: "id",
      hidden: false,
      readonly: true,
    },
    schema: {
      name: "id",
      table: "posts",
      data_type: "integer",
      is_primary_key: true,
      is_nullable: false,
      is_unique: true,
      has_auto_increment: true,
    },
  },
  {
    field: "title",
    type: "string",
    collection: "posts",
    meta: {
      id: 2,
      collection: "posts",
      field: "title",
      hidden: false,
      readonly: false,
      note: "Title",
    },
    schema: {
      name: "title",
      table: "posts",
      data_type: "text",
      is_primary_key: false,
      is_nullable: false,
      is_unique: false,
      has_auto_increment: false,
    },
  },
  {
    field: "status",
    type: "string",
    collection: "posts",
    meta: {
      id: 3,
      collection: "posts",
      field: "status",
      hidden: false,
      readonly: false,
      note: "Status",
    },
    schema: {
      name: "status",
      table: "posts",
      data_type: "text",
      is_primary_key: false,
      is_nullable: false,
      is_unique: false,
      has_auto_increment: false,
    },
  },
  {
    field: "author",
    type: "string",
    collection: "posts",
    meta: {
      id: 4,
      collection: "posts",
      field: "author",
      hidden: false,
      readonly: false,
      note: "Author",
    },
    schema: {
      name: "author",
      table: "posts",
      data_type: "text",
      is_primary_key: false,
      is_nullable: true,
      is_unique: false,
      has_auto_increment: false,
    },
  },
  {
    field: "category",
    type: "string",
    collection: "posts",
    meta: {
      id: 5,
      collection: "posts",
      field: "category",
      hidden: false,
      readonly: false,
      note: "Category",
    },
    schema: {
      name: "category",
      table: "posts",
      data_type: "text",
      is_primary_key: false,
      is_nullable: true,
      is_unique: false,
      has_auto_increment: false,
    },
  },
  {
    field: "word_count",
    type: "integer",
    collection: "posts",
    meta: {
      id: 6,
      collection: "posts",
      field: "word_count",
      hidden: false,
      readonly: false,
      note: "Word Count",
    },
    schema: {
      name: "word_count",
      table: "posts",
      data_type: "integer",
      is_primary_key: false,
      is_nullable: true,
      is_unique: false,
      has_auto_increment: false,
    },
  },
  {
    field: "published_at",
    type: "timestamp",
    collection: "posts",
    meta: {
      id: 7,
      collection: "posts",
      field: "published_at",
      hidden: false,
      readonly: false,
      note: "Published",
    },
    schema: {
      name: "published_at",
      table: "posts",
      data_type: "timestamptz",
      is_primary_key: false,
      is_nullable: true,
      is_unique: false,
      has_auto_increment: false,
    },
  },
];

const MOCK_ITEMS = [
  {
    id: 1,
    title: "Getting Started with Buildpad",
    status: "published",
    author: "Jane Smith",
    category: "Tutorial",
    word_count: 2400,
    published_at: "2025-06-01",
  },
  {
    id: 2,
    title: "Building Dynamic Forms",
    status: "published",
    author: "John Doe",
    category: "Guide",
    word_count: 1800,
    published_at: "2025-06-10",
  },
  {
    id: 3,
    title: "Advanced Table Patterns",
    status: "draft",
    author: "Alice Brown",
    category: "Tutorial",
    word_count: 3100,
    published_at: null,
  },
  {
    id: 4,
    title: "Authentication & Permissions",
    status: "published",
    author: "Bob Wilson",
    category: "Security",
    word_count: 2200,
    published_at: "2025-07-01",
  },
  {
    id: 5,
    title: "Relational Interfaces Guide",
    status: "review",
    author: "Charlie Davis",
    category: "Guide",
    word_count: 2750,
    published_at: null,
  },
  {
    id: 6,
    title: "Deploying to Amplify",
    status: "published",
    author: "Jane Smith",
    category: "DevOps",
    word_count: 1600,
    published_at: "2025-07-15",
  },
  {
    id: 7,
    title: "Custom Interface Components",
    status: "draft",
    author: "John Doe",
    category: "Advanced",
    word_count: 4200,
    published_at: null,
  },
  {
    id: 8,
    title: "File Upload Patterns",
    status: "published",
    author: "Alice Brown",
    category: "Guide",
    word_count: 1950,
    published_at: "2025-08-01",
  },
  {
    id: 9,
    title: "Workflow State Machines",
    status: "published",
    author: "Bob Wilson",
    category: "Advanced",
    word_count: 3600,
    published_at: "2025-08-15",
  },
  {
    id: 10,
    title: "Multitenancy Best Practices",
    status: "review",
    author: "Charlie Davis",
    category: "Architecture",
    word_count: 2900,
    published_at: null,
  },
];

/**
 * Decorator that intercepts fetch calls to /api/* and returns mock data
 * so the stories work without a running DaaS backend.
 */
const withMockApi: Decorator = (Story) => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.href
        : input.url;

    // Mock fields endpoint
    if (url.includes("/api/fields/")) {
      return new Response(JSON.stringify({ data: MOCK_FIELDS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mock items endpoint
    if (url.includes("/api/items/")) {
      return new Response(JSON.stringify({ data: MOCK_ITEMS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return originalFetch(input, init);
  };

  React.useEffect(() => {
    return () => {
      window.fetch = originalFetch;
    };
  });

  return <Story />;
};

// ============================================================================
// Meta
// ============================================================================

const meta = {
  title: "Collections/CollectionList",
  component: CollectionList,
  decorators: [withMockApi],
  tags: ["!autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A data-connected list that composes VTable for sorting, resize, reorder, and selection. " +
          "Fetches fields & items from FieldsService / ItemsService. " +
          "Right-click column headers for sort, align, and hide options. " +
          "These stories use mock data. For live DaaS data, use the **Playground** story.",
      },
    },
  },
  argTypes: {
    collection: { control: "text", description: "Collection name to display" },
    enableSelection: { control: "boolean" },
    enableSearch: { control: "boolean" },
    enableSort: { control: "boolean" },
    enableResize: { control: "boolean" },
    enableReorder: { control: "boolean" },
    enableHeaderMenu: { control: "boolean" },
    enableAddField: { control: "boolean" },
    limit: { control: "number", description: "Items per page" },
    tableSpacing: {
      control: "select",
      options: ["compact", "cozy", "comfortable"],
    },
  },
} satisfies Meta<typeof CollectionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default list displaying collection items with VTable.
 * Supports sorting, column resize, and reorder out of the box.
 * Right-click a column header for sort/align/hide options.
 */
export const Default: Story = {
  args: {
    collection: "posts",
    enableSearch: true,
    enableSort: true,
    enableResize: true,
    enableReorder: true,
    enableHeaderMenu: true,
    enableAddField: true,
    limit: 25,
    tableSpacing: "cozy",
  },
};

/**
 * With row selection enabled for bulk actions.
 */
export const WithSelection: Story = {
  args: {
    collection: "posts",
    enableSelection: true,
    enableSearch: true,
    limit: 25,
    bulkActions: [
      {
        label: "Delete",
        color: "red",
        action: (ids) => alert(`Delete: ${ids.join(", ")}`),
      },
      {
        label: "Archive",
        action: (ids) => alert(`Archive: ${ids.join(", ")}`),
      },
    ],
  },
};

/**
 * Compact spacing with limited columns.
 */
export const CompactSpacing: Story = {
  args: {
    collection: "posts",
    tableSpacing: "compact",
    fields: ["id", "title", "status"],
    limit: 25,
  },
};

/**
 * Comfortable spacing for touch-friendly interfaces.
 */
export const ComfortableSpacing: Story = {
  args: {
    collection: "posts",
    tableSpacing: "comfortable",
    limit: 25,
  },
};

/**
 * With all interactive features disabled.
 */
export const ReadOnly: Story = {
  args: {
    collection: "posts",
    enableSort: false,
    enableResize: false,
    enableReorder: false,
    enableHeaderMenu: false,
    enableAddField: false,
    enableSearch: false,
    enableSelection: false,
    limit: 25,
  },
};

/**
 * With a DaaS-style filter applied.
 * Only items matching the filter are shown (mock data ignores the filter,
 * but the prop is passed through correctly to the API layer).
 */
export const WithFilter: Story = {
  args: {
    collection: "posts",
    filter: {
      _and: [{ status: { _eq: "published" } }, { word_count: { _gt: 2000 } }],
    },
    enableSearch: true,
    limit: 25,
  },
};

/**
 * Item click callback — fires when a row is clicked.
 * The clicked item data is displayed below the table.
 */
export const WithItemClick: Story = {
  render: () => {
    const [clicked, setClicked] = useState<Record<string, unknown> | null>(
      null,
    );

    return (
      <Stack gap="md">
        <CollectionList
          collection="posts"
          enableSearch
          limit={25}
          onItemClick={(item) => setClicked(item as Record<string, unknown>)}
        />
        <Paper p="sm" withBorder>
          <Text size="sm" fw={600} mb={4}>
            Last clicked item:
          </Text>
          <Code block style={{ maxHeight: 120, overflow: "auto" }}>
            {clicked ? JSON.stringify(clicked, null, 2) : "(click a row)"}
          </Code>
        </Paper>
      </Stack>
    );
  },
};

/**
 * Custom row height — override the spacing preset with an explicit pixel value.
 */
export const CustomRowHeight: Story = {
  args: {
    collection: "posts",
    rowHeight: 64,
    limit: 25,
  },
};

/**
 * Specific fields — display only a subset of columns.
 */
export const SpecificFields: Story = {
  args: {
    collection: "posts",
    fields: ["id", "title", "author", "published_at"],
    enableSort: true,
    enableResize: true,
    limit: 25,
  },
};
