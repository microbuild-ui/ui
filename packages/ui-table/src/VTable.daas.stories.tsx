import React, { useState, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { 
  TextInput, 
  Button, 
  Stack, 
  Alert, 
  Code, 
  Group, 
  Text, 
  Paper, 
  Badge, 
  Divider, 
  Select, 
  NumberInput,
} from '@mantine/core';
import { 
  IconPlugConnected, 
  IconPlugConnectedX, 
  IconRefresh, 
  IconCloudDownload, 
  IconServer, 
  IconKey,
  IconTable,
  IconDatabase,
} from '@tabler/icons-react';
import { VTable } from './VTable';
import type { HeaderRaw, Item, Sort } from './types';

/**
 * VTable - DaaS Connected Playground
 * 
 * This story connects to a real DaaS instance to fetch items and test
 * the VTable component with actual collection data.
 * 
 * ## Authentication
 * 
 * The playground uses static token authentication via Vite proxy:
 * - **Proxy Mode** - Uses environment variables for seamless authentication
 * 
 * ## Proxy Mode (Recommended - No CORS Issues)
 * 
 * Start Storybook with environment variables:
 * ```bash
 * STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \
 * STORYBOOK_DAAS_TOKEN=your-static-token \
 * pnpm storybook:table
 * ```
 * 
 * This enables a Vite proxy that forwards `/api/*` requests to DaaS,
 * avoiding CORS issues entirely.
 * 
 * ## How It Works
 * - Authenticates using static token (Bearer header via proxy)
 * - Fetches items from `/api/items/{collection}` (proxied or direct)
 * - Fetches fields to generate table headers
 * - Renders VTable with the fetched data
 */
const meta: Meta<typeof VTable> = {
  title: 'Tables/VTable DaaS Playground',
  component: VTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Connect VTable to a real DaaS instance and test with actual collection data. Features pagination, sorting, and selection.',
      },
    },
  },
};

export default meta;

// ============================================================================
// Check if Proxy Mode is enabled via environment variables
// Storybook exposes STORYBOOK_* env vars to the browser
// ============================================================================
const getProxyModeEnabled = (): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Boolean(typeof window !== 'undefined' && (import.meta as any).env?.STORYBOOK_DAAS_URL);
  } catch {
    return false;
  }
};
const PROXY_MODE_ENABLED = getProxyModeEnabled();

// ============================================================================
// DaaS API Helper - Supports both proxy and direct modes
// ============================================================================

interface DaaSConfig {
  url: string;
  token: string;
}

interface FieldInfo {
  field: string;
  type: string;
  meta?: {
    interface?: string;
    hidden?: boolean;
    width?: string;
  };
}

/**
 * Fetch collections - uses proxy in proxy mode, direct fetch otherwise
 */
async function fetchCollectionsFromDaaS(config?: DaaSConfig): Promise<string[]> {
  if (PROXY_MODE_ENABLED || !config) {
    const response = await fetch(`/api/collections`);
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }
    const data = await response.json() as { data?: Array<{ collection: string }> };
    // Include directus_users for testing, filter other system tables
    return (data.data || [])
      .map((c) => c.collection)
      .filter((name) => name === 'directus_users' || !name.startsWith('directus_'));
  } else {
    const response = await fetch(`${config.url}/collections`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }
    
    const data = await response.json() as { data?: Array<{ collection: string }> };
    // Include directus_users for testing, filter other system tables
    return (data.data || [])
      .map((c) => c.collection)
      .filter((name) => name === 'directus_users' || !name.startsWith('directus_'));
  }
}

/**
 * Fetch fields for a collection - to generate table headers
 */
async function fetchFieldsFromDaaS(collection: string, config?: DaaSConfig): Promise<FieldInfo[]> {
  if (PROXY_MODE_ENABLED || !config) {
    const url = `/api/fields/${collection}?_t=${Date.now()}`;
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json() as { data?: FieldInfo[] };
    return data.data || [];
  } else {
    const response = await fetch(`${config.url}/fields/${collection}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`DaaS API Error: ${response.status}`);
    }
    
    const data = await response.json() as { data?: FieldInfo[] };
    return data.data || [];
  }
}

interface ItemsResponse {
  data?: Item[];
  meta?: { total_count?: number };
}

/**
 * Fetch items from a collection
 */
async function fetchItemsFromDaaS(
  collection: string, 
  options: { limit?: number; offset?: number; sort?: string } = {},
  config?: DaaSConfig
): Promise<{ items: Item[]; total: number }> {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.offset) params.set('offset', String(options.offset));
  if (options.sort) params.set('sort', options.sort);
  params.set('meta', 'total_count');

  if (PROXY_MODE_ENABLED || !config) {
    const url = `/api/items/${collection}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status}`);
    }
    const data = await response.json() as ItemsResponse;
    return { 
      items: data.data || [], 
      total: data.meta?.total_count || data.data?.length || 0 
    };
  } else {
    const response = await fetch(`${config.url}/items/${collection}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status}`);
    }
    
    const data = await response.json() as ItemsResponse;
    return { 
      items: data.data || [], 
      total: data.meta?.total_count || data.data?.length || 0 
    };
  }
}

// ============================================================================
// DaaS Connection Component
// ============================================================================

interface DaaSConnectionProps {
  onDataLoaded: (items: Item[], headers: HeaderRaw[], collection: string, total: number) => void;
  onConfigChange: (config: DaaSConfig | null) => void;
  pageSize: number;
  currentPage: number;
  sort: Sort | null;
}

const DaaSConnection: React.FC<DaaSConnectionProps> = ({ 
  onDataLoaded, 
  onConfigChange,
  pageSize,
  currentPage,
  sort,
}) => {
  const [collection, setCollection] = useState(() => 
    localStorage.getItem('storybook_daas_table_collection') || 'interface_showcase'
  );
  
  const [daasUrl, setDaasUrl] = useState(() => 
    localStorage.getItem('storybook_daas_url') || ''
  );
  const [daasToken, setDaasToken] = useState(() => 
    localStorage.getItem('storybook_daas_token') || ''
  );
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('storybook_daas_table_collection', collection);
    if (!PROXY_MODE_ENABLED) {
      localStorage.setItem('storybook_daas_url', daasUrl);
      localStorage.setItem('storybook_daas_token', daasToken);
    }
  }, [daasUrl, daasToken, collection]);

  useEffect(() => {
    if (PROXY_MODE_ENABLED) {
      connectProxy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectProxy = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const collectionList = await fetchCollectionsFromDaaS();
      setCollections(collectionList);
      setIsConnected(true);
      onConfigChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proxy connection failed');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [onConfigChange]);

  const connectDirect = useCallback(async () => {
    if (!daasUrl || !daasToken) {
      setError('Please enter DaaS URL and Token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const config: DaaSConfig = { url: daasUrl, token: daasToken };
      const collectionList = await fetchCollectionsFromDaaS(config);
      setCollections(collectionList);
      setIsConnected(true);
      onConfigChange(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. CORS may be blocking the request.');
      setIsConnected(false);
      onConfigChange(null);
    } finally {
      setIsLoading(false);
    }
  }, [daasUrl, daasToken, onConfigChange]);

  const loadData = useCallback(async (config?: DaaSConfig) => {
    if (!collection) {
      setError('Please select a collection');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch fields to generate headers
      const fields = await fetchFieldsFromDaaS(collection, config);
      
      // Convert fields to headers (exclude hidden fields)
      const headers: HeaderRaw[] = fields
        .filter(f => !f.meta?.hidden && f.field !== 'id')
        .slice(0, 8) // Limit to first 8 visible fields for better UX
        .map(f => ({
          text: f.field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          value: f.field,
          sortable: true,
          width: f.meta?.width === 'full' ? 300 : f.meta?.width === 'half' ? 200 : 150,
        }));
      
      // Add ID as first column
      headers.unshift({
        text: 'ID',
        value: 'id',
        sortable: true,
        width: 80,
      });

      // Fetch items with pagination and sorting
      const sortString = sort ? `${sort.desc ? '-' : ''}${sort.by}` : undefined;
      const { items, total } = await fetchItemsFromDaaS(
        collection,
        {
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          sort: sortString,
        },
        config
      );

      onDataLoaded(items, headers, collection, total);
    } catch (err) {
      console.error('[DaaS Table] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [collection, pageSize, currentPage, sort, onDataLoaded]);

  const handleLoadCollection = async () => {
    const config = PROXY_MODE_ENABLED ? undefined : { url: daasUrl, token: daasToken };
    await loadData(config);
  };

  return (
    <Paper p="md" withBorder mb="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <Text fw={600} size="lg">🔌 DaaS Connection</Text>
            {PROXY_MODE_ENABLED && (
              <Badge color="blue" size="sm" leftSection={<IconServer size={10} />}>
                Proxy Mode
              </Badge>
            )}
          </Group>
          {isConnected ? (
            <Badge color="green" leftSection={<IconPlugConnected size={12} />}>
              Connected
            </Badge>
          ) : (
            <Badge color="gray" leftSection={<IconPlugConnectedX size={12} />}>
              Not Connected
            </Badge>
          )}
        </Group>

        {PROXY_MODE_ENABLED ? (
          <Alert color="green" title="Proxy Mode Active" icon={<IconKey size={16} />}>
            <Text size="sm">
              Storybook is configured with DaaS proxy via environment variables.
              All <Code>/api/*</Code> requests are forwarded to your DaaS instance
              with automatic authentication.
            </Text>
            <Text size="sm" mt="xs" fw={500}>
              Ready to load data - select a collection below!
            </Text>
          </Alert>
        ) : (
          <>
            <Alert color="yellow" title="Direct Mode (CORS Warning)">
              <Text size="sm">
                Requests go directly from your browser to DaaS. This may fail due to CORS.
              </Text>
              <Text size="sm" mt="xs">
                <strong>Recommended:</strong> Start Storybook with proxy configuration:
              </Text>
              <Code block mt="xs" style={{ fontSize: '11px' }}>
{`STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \\
STORYBOOK_DAAS_TOKEN=your-token \\
pnpm storybook:table`}
              </Code>
            </Alert>

            <TextInput
              label="DaaS URL"
              placeholder="https://xxx.microbuild-daas.xtremax.com"
              value={daasUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDaasUrl(e.target.value)}
              description="Your DaaS instance URL (without /api prefix)"
            />

            <TextInput
              label="Static Token"
              placeholder="Enter your static token..."
              value={daasToken}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDaasToken(e.target.value)}
              description="Generate from Users → Edit User → Generate Token"
              type="password"
            />

            <Group>
              <Button
                onClick={connectDirect}
                loading={isLoading && !isConnected}
                leftSection={<IconPlugConnected size={16} />}
                disabled={!daasUrl || !daasToken}
              >
                Connect
              </Button>
            </Group>
          </>
        )}

        {isConnected && (
          <>
            <Divider label="Load Collection Data" labelPosition="center" />
            
            {collections.length > 0 ? (
              <Select
                label="Collection"
                placeholder="Select a collection..."
                data={collections}
                value={collection}
                onChange={(val) => setCollection(val || '')}
                searchable
                description={`${collections.length} collections available`}
                leftSection={<IconDatabase size={16} />}
              />
            ) : (
              <TextInput
                label="Collection Name"
                placeholder="e.g., interface_showcase"
                value={collection}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCollection(e.target.value)}
              />
            )}

            <Group>
              <Button
                onClick={handleLoadCollection}
                loading={isLoading}
                leftSection={<IconCloudDownload size={16} />}
                disabled={!collection}
              >
                Load Data
              </Button>
              
              <Button
                variant="light"
                onClick={handleLoadCollection}
                leftSection={<IconRefresh size={16} />}
                disabled={!collection}
              >
                Refresh
              </Button>
            </Group>
          </>
        )}

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

// ============================================================================
// DaaS Table Playground Component
// ============================================================================

const DaaSTablePlayground: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [headers, setHeaders] = useState<HeaderRaw[]>([]);
  const [collection, setCollection] = useState<string>('');
  const [totalItems, setTotalItems] = useState(0);
  
  // Table state
  const [selectedItems, setSelectedItems] = useState<unknown[]>([]);
  const [sort, setSort] = useState<Sort | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSelect, setShowSelect] = useState<'none' | 'one' | 'multiple'>('multiple');

  const handleDataLoaded = (
    loadedItems: Item[], 
    loadedHeaders: HeaderRaw[], 
    collectionName: string,
    total: number
  ) => {
    setItems(loadedItems);
    setHeaders(loadedHeaders);
    setCollection(collectionName);
    setTotalItems(total);
    setSelectedItems([]);
  };

  const handleConfigChange = (_config: DaaSConfig | null) => {
    // Config is managed internally by DaaSConnection
  };

  const handleSortChange = (newSort: Sort | null) => {
    setSort(newSort);
    // Reset to first page on sort change
    setCurrentPage(1);
  };

  const handleSelect = (item: Item) => {
    const itemId = item.id as string | number;
    if (showSelect === 'one') {
      setSelectedItems((selectedItems as (string | number)[]).includes(itemId) ? [] : [itemId]);
    } else if (showSelect === 'multiple') {
      setSelectedItems(
        (selectedItems as (string | number)[]).includes(itemId)
          ? (selectedItems as (string | number)[]).filter(id => id !== itemId)
          : [...selectedItems, itemId]
      );
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <Stack gap="lg">
      <DaaSConnection 
        onDataLoaded={handleDataLoaded} 
        onConfigChange={handleConfigChange}
        pageSize={pageSize}
        currentPage={currentPage}
        sort={sort}
      />

      {headers.length > 0 ? (
        <>
          {/* Table Settings */}
          <Paper p="md" withBorder>
            <Group gap="xl">
              <Select
                label="Selection Mode"
                data={[
                  { value: 'none', label: 'No Selection' },
                  { value: 'one', label: 'Single Selection' },
                  { value: 'multiple', label: 'Multiple Selection' },
                ]}
                value={showSelect}
                onChange={(val) => setShowSelect(val as 'none' | 'one' | 'multiple')}
                style={{ width: 180 }}
              />
              
              <NumberInput
                label="Page Size"
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val) || 10);
                  setCurrentPage(1);
                }}
                min={5}
                max={100}
                step={5}
                style={{ width: 100 }}
              />
              
              <Stack gap={4}>
                <Text size="sm" fw={500}>Pagination</Text>
                <Group gap="xs">
                  <Button 
                    size="xs" 
                    variant="light"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Prev
                  </Button>
                  <Text size="sm">
                    Page {currentPage} of {totalPages || 1}
                  </Text>
                  <Button 
                    size="xs" 
                    variant="light"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </Group>
              </Stack>
            </Group>
          </Paper>

          {/* Selection Status */}
          {showSelect !== 'none' && (
            <Text size="sm" c="dimmed">
              Selected: {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
              {selectedItems.length > 0 && (
                <> — IDs: {selectedItems.slice(0, 5).join(', ')}{selectedItems.length > 5 ? '...' : ''}</>
              )}
            </Text>
          )}

          {/* Table */}
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconTable size={20} />
                <Text fw={600}>Table: {collection}</Text>
              </Group>
              <Badge color="blue">
                {totalItems} total items
              </Badge>
            </Group>
            
            <VTable
              headers={headers}
              items={items}
              showSelect={showSelect}
              value={selectedItems}
              sort={sort}
              onItemSelected={({ item }) => handleSelect(item)}
              onUpdate={setSelectedItems}
              onSortChange={handleSortChange}
              itemKey="id"
              fixedHeader
            />
          </Paper>

          {/* Current Sort */}
          {sort && (
            <Paper p="sm" withBorder>
              <Text size="sm">
                <strong>Current Sort:</strong> {sort.by} ({sort.desc ? 'descending' : 'ascending'})
              </Text>
            </Paper>
          )}

          {/* Raw Data Preview */}
          <Paper p="md" withBorder>
            <Text fw={600} mb="sm">Raw Data {items.length > 0 ? `(first ${Math.min(3, items.length)} items)` : '(empty collection)'}:</Text>
            <Code block style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
              {items.length > 0 ? JSON.stringify(items.slice(0, 3), null, 2) : '[]'}
            </Code>
          </Paper>
        </>
      ) : (
        <Alert color="blue" title={PROXY_MODE_ENABLED ? "Select a Collection" : "Connect to DaaS"} icon={<IconDatabase size={16} />}>
          <Text size="sm">
            {PROXY_MODE_ENABLED 
              ? "Proxy mode is active. Select a collection from the dropdown and click 'Load Data' to see items in the table."
              : "Enter your DaaS URL and static token above, then load a collection to see the table."
            }
          </Text>
          <Text size="sm" mt="xs">
            <strong>Tip:</strong> The <Code>directus_users</Code> collection has sample data for testing.
          </Text>
        </Alert>
      )}
    </Stack>
  );
};

// ============================================================================
// Story Export
// ============================================================================

/**
 * DaaS Connected Playground
 * 
 * Connect to a real DaaS instance and test VTable with actual collection data.
 * Features pagination, sorting, and selection.
 */
export const Playground: StoryObj<typeof VTable> = {
  render: () => <DaaSTablePlayground />,
  parameters: {
    docs: {
      description: {
        story: `
## DaaS Table Playground

This playground connects to a real DaaS instance to test VTable with live data.

### Features

- **Collection Selection**: Browse and select from available collections
- **Pagination**: Navigate through large datasets
- **Sorting**: Click column headers to sort
- **Selection**: Single or multiple row selection
- **Live Data**: See real data from your DaaS instance

### Proxy Mode (Recommended)

Start Storybook with environment variables to enable DaaS proxy:

\`\`\`bash
STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \\
STORYBOOK_DAAS_TOKEN=your-static-token \\
pnpm storybook:table
\`\`\`

This enables a Vite proxy that forwards \`/api/*\` requests to DaaS, avoiding CORS issues.

### Getting a Static Token

1. Log into DaaS as admin
2. Go to **Users** → Edit your user
3. Scroll to **Token** field → Click **Generate Token**
4. **Copy the token** (it won't be shown again!)
5. Click **Save**
        `,
      },
    },
  },
};
