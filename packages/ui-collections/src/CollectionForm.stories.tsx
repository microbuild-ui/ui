import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Code, Paper, Stack, Text } from "@mantine/core";
import { CollectionForm } from "./CollectionForm";

// ============================================================================
// Mock Data — stories work offline without a DaaS backend
// ============================================================================

const MOCK_FIELDS = [
  {
    field: "id",
    type: "integer",
    meta: { hidden: true, readonly: true, interface: null, width: "full" },
    schema: { is_primary_key: true, has_auto_increment: true },
  },
  {
    field: "title",
    type: "string",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "full",
      required: true,
      note: "Post title",
    },
    schema: { max_length: 255, is_nullable: false },
  },
  {
    field: "status",
    type: "string",
    meta: {
      hidden: false,
      readonly: false,
      interface: "select-dropdown",
      width: "half",
      options: {
        choices: [
          { text: "Draft", value: "draft" },
          { text: "Published", value: "published" },
          { text: "Archived", value: "archived" },
        ],
      },
    },
    schema: { default_value: "draft" },
  },
  {
    field: "category",
    type: "string",
    meta: {
      hidden: false,
      readonly: false,
      interface: "select-dropdown",
      width: "half",
      options: {
        choices: [
          { text: "Tutorial", value: "tutorial" },
          { text: "Guide", value: "guide" },
          { text: "News", value: "news" },
        ],
      },
    },
    schema: {},
  },
  {
    field: "content",
    type: "text",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input-multiline",
      width: "full",
      note: "Post content",
    },
    schema: {},
  },
  {
    field: "featured",
    type: "boolean",
    meta: {
      hidden: false,
      readonly: false,
      interface: "boolean",
      width: "half",
    },
    schema: { default_value: false },
  },
];

const MOCK_ITEM = {
  id: 1,
  title: "Getting Started with Buildpad",
  status: "published",
  category: "tutorial",
  content:
    "This guide covers the basics of building forms and tables with Buildpad UI components.",
  featured: true,
};

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

    // Mock single item endpoint (for edit mode)
    if (url.match(/\/api\/items\/\w+\/\d+/)) {
      return new Response(JSON.stringify({ data: MOCK_ITEM }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mock create/update item endpoint
    if (
      url.includes("/api/items/") &&
      init?.method &&
      ["POST", "PATCH"].includes(init.method)
    ) {
      return new Response(JSON.stringify({ data: { id: 99 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mock items list endpoint
    if (url.includes("/api/items/")) {
      return new Response(JSON.stringify({ data: [MOCK_ITEM] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return originalFetch(input, init);
  };

  // Cleanup on unmount
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
  title: "Collections/CollectionForm",
  component: CollectionForm,
  decorators: [withMockApi],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A CRUD wrapper around VForm that handles data fetching and persistence. " +
          "These stories use mock data. For live DaaS data, use the **Playground** story.",
      },
    },
  },
  argTypes: {
    collection: {
      control: "text",
      description: "Collection name",
    },
    mode: {
      control: "select",
      options: ["create", "edit"],
    },
    id: {
      control: "text",
      description: "Item ID for edit mode",
    },
  },
} satisfies Meta<typeof CollectionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Create mode — renders an empty form for a new item.
 * Uses mock data — no backend required.
 */
export const CreateMode: Story = {
  args: {
    collection: "posts",
    mode: "create",
  },
};

/**
 * Edit mode — loads an existing item and renders its data.
 * Uses mock data — no backend required.
 */
export const EditMode: Story = {
  args: {
    collection: "posts",
    mode: "edit",
    id: "1",
  },
};
/**
 * Create mode with default values pre-filled.
 */
export const WithDefaultValues: Story = {
  args: {
    collection: "posts",
    mode: "create",
    defaultValues: {
      status: "draft",
      category: "tutorial",
      featured: false,
    },
  },
};

/**
 * Exclude specific fields from the form.
 * Here we hide "featured" and "category" so only title, status, and content appear.
 */
export const WithExcludeFields: Story = {
  args: {
    collection: "posts",
    mode: "create",
    excludeFields: ["featured", "category"],
  },
};

/**
 * Only include specific fields.
 * Here the form shows only title and status.
 */
export const WithIncludeFields: Story = {
  args: {
    collection: "posts",
    mode: "create",
    includeFields: ["title", "status"],
  },
};

/**
 * Demonstrating onSuccess and onCancel callbacks.
 * The last triggered callback is displayed above the form.
 */
export const WithCallbacks: Story = {
  render: () => {
    const [lastCallback, setLastCallback] = useState<string>("");

    return (
      <Stack gap="md">
        <Paper p="sm" withBorder>
          <Text size="sm" c="dimmed">
            Last callback: <Code>{lastCallback || "(none)"}</Code>
          </Text>
        </Paper>
        <CollectionForm
          collection="posts"
          mode="create"
          onSuccess={(data) =>
            setLastCallback(`onSuccess(${JSON.stringify(data)})`)
          }
          onCancel={() => setLastCallback("onCancel()")}
        />
      </Stack>
    );
  },
};

// ============================================================================
// Group Interface Mock Data
// ============================================================================

const MOCK_GROUP_FIELDS = [
  {
    field: "id",
    type: "integer",
    collection: "articles",
    meta: {
      hidden: true,
      readonly: true,
      interface: null,
      width: "full",
      group: null,
      special: null,
      sort: 0,
    },
    schema: { is_primary_key: true, has_auto_increment: true },
  },
  {
    field: "title",
    type: "string",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "full",
      required: true,
      note: "Article title",
      group: null,
      special: null,
      sort: 1,
    },
    schema: { max_length: 255, is_nullable: false },
  },
  // Group Detail: Basic Info (starts open)
  {
    field: "basic_info",
    type: "alias",
    collection: "articles",
    name: "Basic Information",
    meta: {
      hidden: false,
      readonly: false,
      interface: "group-detail",
      width: "full",
      group: null,
      special: ["alias", "group", "no-data"],
      sort: 2,
      options: { start: "open", headerIcon: "menu_open" },
    },
    schema: undefined,
  },
  // Children of basic_info
  {
    field: "author",
    type: "string",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "half",
      group: "basic_info",
      special: null,
      sort: 1,
    },
    schema: { max_length: 255 },
  },
  {
    field: "category",
    type: "string",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "select-dropdown",
      width: "half",
      group: "basic_info",
      special: null,
      sort: 2,
      options: {
        choices: [
          { text: "Tutorial", value: "tutorial" },
          { text: "Guide", value: "guide" },
          { text: "News", value: "news" },
        ],
      },
    },
    schema: {},
  },
  {
    field: "summary",
    type: "text",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input-multiline",
      width: "full",
      group: "basic_info",
      special: null,
      sort: 3,
    },
    schema: {},
  },
  // Group Detail: Settings (starts closed)
  {
    field: "settings_group",
    type: "alias",
    collection: "articles",
    name: "Settings",
    meta: {
      hidden: false,
      readonly: false,
      interface: "group-detail",
      width: "full",
      group: null,
      special: ["alias", "group", "no-data"],
      sort: 3,
      options: { start: "closed" },
    },
    schema: undefined,
  },
  {
    field: "status",
    type: "string",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "select-dropdown",
      width: "half",
      group: "settings_group",
      special: null,
      sort: 1,
      options: {
        choices: [
          { text: "Draft", value: "draft" },
          { text: "Published", value: "published" },
          { text: "Archived", value: "archived" },
        ],
      },
    },
    schema: { default_value: "draft" },
  },
  {
    field: "featured",
    type: "boolean",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "boolean",
      width: "half",
      group: "settings_group",
      special: null,
      sort: 2,
    },
    schema: { default_value: false },
  },
  // Group Raw: Flags (transparent wrapper)
  {
    field: "flags_group",
    type: "alias",
    collection: "articles",
    name: "Flags",
    meta: {
      hidden: false,
      readonly: false,
      interface: "group-raw",
      width: "full",
      group: null,
      special: ["alias", "group", "no-data"],
      sort: 4,
    },
    schema: undefined,
  },
  {
    field: "pinned",
    type: "boolean",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "boolean",
      width: "half",
      group: "flags_group",
      special: null,
      sort: 1,
    },
    schema: {},
  },
  {
    field: "archived",
    type: "boolean",
    collection: "articles",
    meta: {
      hidden: false,
      readonly: false,
      interface: "boolean",
      width: "half",
      group: "flags_group",
      special: null,
      sort: 2,
    },
    schema: {},
  },
];

/**
 * Decorator that intercepts fetch calls and returns group-aware mock data.
 */
const withMockGroupApi: Decorator = (Story) => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.includes("/api/fields/")) {
      return new Response(JSON.stringify({ data: MOCK_GROUP_FIELDS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.includes("/api/items/") &&
      init?.method &&
      ["POST", "PATCH"].includes(init.method)
    ) {
      return new Response(JSON.stringify({ data: { id: 99 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/api/items/")) {
      return new Response(JSON.stringify({ data: [] }), {
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

/**
 * Form with group interfaces (group-detail, group-raw).
 * Fields are organized into collapsible sections.
 * "Basic Information" starts open, "Settings" starts closed,
 * "Flags" uses group-raw (transparent wrapper).
 */
export const WithGroupInterfaces: Story = {
  decorators: [withMockGroupApi],
  args: {
    collection: "articles",
    mode: "create",
  },
};

// ============================================================================
// Group Accordion Mock Data
// ============================================================================

const MOCK_ACCORDION_FIELDS = [
  {
    field: "id",
    type: "integer",
    collection: "contacts",
    meta: {
      hidden: true,
      readonly: true,
      interface: null,
      width: "full",
      group: null,
      special: null,
      sort: 0,
    },
    schema: { is_primary_key: true, has_auto_increment: true },
  },
  {
    field: "full_name",
    type: "string",
    collection: "contacts",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "full",
      required: true,
      group: null,
      special: null,
      sort: 1,
    },
    schema: { max_length: 255, is_nullable: false },
  },
  // Accordion parent
  {
    field: "details_accordion",
    type: "alias",
    collection: "contacts",
    name: "Details",
    meta: {
      hidden: false,
      readonly: false,
      interface: "group-accordion",
      width: "full",
      group: null,
      special: ["alias", "group", "no-data"],
      sort: 2,
      options: { accordionMode: true, start: "first" },
    },
    schema: undefined,
  },
  // Section A (group child of accordion)
  {
    field: "contact_section",
    type: "alias",
    collection: "contacts",
    name: "Contact Info",
    meta: {
      hidden: false,
      readonly: false,
      interface: "group-detail",
      width: "full",
      group: "details_accordion",
      special: ["alias", "group", "no-data"],
      sort: 1,
    },
    schema: undefined,
  },
  {
    field: "email",
    type: "string",
    collection: "contacts",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "half",
      group: "contact_section",
      special: null,
      sort: 1,
    },
    schema: { max_length: 255 },
  },
  {
    field: "phone",
    type: "string",
    collection: "contacts",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "half",
      group: "contact_section",
      special: null,
      sort: 2,
    },
    schema: { max_length: 50 },
  },
  // Section B
  {
    field: "address_section",
    type: "alias",
    collection: "contacts",
    name: "Address",
    meta: {
      hidden: false,
      readonly: false,
      interface: "group-detail",
      width: "full",
      group: "details_accordion",
      special: ["alias", "group", "no-data"],
      sort: 2,
    },
    schema: undefined,
  },
  {
    field: "street",
    type: "string",
    collection: "contacts",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "full",
      group: "address_section",
      special: null,
      sort: 1,
    },
    schema: { max_length: 255 },
  },
  {
    field: "city",
    type: "string",
    collection: "contacts",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "half",
      group: "address_section",
      special: null,
      sort: 2,
    },
    schema: { max_length: 100 },
  },
  {
    field: "zip_code",
    type: "string",
    collection: "contacts",
    meta: {
      hidden: false,
      readonly: false,
      interface: "input",
      width: "half",
      group: "address_section",
      special: null,
      sort: 3,
    },
    schema: { max_length: 20 },
  },
];

const withMockAccordionApi: Decorator = (Story) => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.includes("/api/fields/")) {
      return new Response(JSON.stringify({ data: MOCK_ACCORDION_FIELDS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.includes("/api/items/") &&
      init?.method &&
      ["POST", "PATCH"].includes(init.method)
    ) {
      return new Response(JSON.stringify({ data: { id: 99 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/api/items/")) {
      return new Response(JSON.stringify({ data: [] }), {
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

/**
 * Form with group-accordion interface.
 * Accordion sections are group fields containing form fields.
 * "Contact Info" starts open (start=first), "Address" starts closed.
 * In accordion mode, only one section can be open at a time.
 */
export const WithGroupAccordion: Story = {
  decorators: [withMockAccordionApi],
  args: {
    collection: "contacts",
    mode: "create",
  },
};
