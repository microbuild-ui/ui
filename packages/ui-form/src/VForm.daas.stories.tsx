import React, { useState, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput, Button, Stack, Alert, Code, Group, Text, Paper, Badge, Divider, Select } from '@mantine/core';
import { IconPlugConnected, IconPlugConnectedX, IconRefresh, IconCloudDownload, IconServer } from '@tabler/icons-react';
import { VForm } from './VForm';
import type { Field } from '@microbuild/types';
import type { FieldValues } from './types';
import { setGlobalDaaSConfig, DaaSProvider, type DaaSConfig as ServiceDaaSConfig } from '@microbuild/services';

/**
 * VForm - DaaS Connected Playground
 * 
 * This story connects to a real DaaS instance to fetch fields and test
 * the VForm component with actual collection schemas.
 * 
 * ## Proxy Mode (Recommended - No CORS Issues)
 * 
 * Start Storybook with environment variables:
 * ```bash
 * STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \
 * STORYBOOK_DAAS_TOKEN=your-static-token \
 * pnpm storybook:form
 * ```
 * 
 * This enables a Vite proxy that forwards `/api/*` requests to DaaS,
 * avoiding CORS issues entirely.
 * 
 * ## Direct Mode (Manual Entry)
 * 
 * Enter DaaS URL and token manually. Note: This may encounter CORS issues
 * as the browser makes direct requests to DaaS.
 * 
 * ## How It Works
 * - Fetches fields from `/api/fields/{collection}` (proxied or direct)
 * - Renders VForm with the fetched schema
 * - Shows field values in real-time
 */
const meta: Meta<typeof VForm> = {
  title: 'Forms/VForm DaaS Playground',
  component: VForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Connect VForm to a real DaaS instance and test with actual collection schemas.',
      },
    },
  },
};

export default meta;

// ============================================================================
// Check if Proxy Mode is enabled via environment variables
// Storybook exposes STORYBOOK_* env vars to the browser
// ============================================================================
const PROXY_MODE_ENABLED = Boolean(
  // @ts-expect-error - Storybook injects STORYBOOK_* env vars
  typeof window !== 'undefined' && import.meta.env?.STORYBOOK_DAAS_URL
);

// ============================================================================
// DaaS API Helper - Supports both proxy and direct modes
// ============================================================================

interface DaaSConfig {
  url: string;
  token: string;
}

/**
 * Fetch fields - uses proxy in proxy mode, direct fetch otherwise
 */
async function fetchFieldsFromDaaS(collection: string, config?: DaaSConfig): Promise<Field[]> {
  if (PROXY_MODE_ENABLED || !config) {
    // Proxy mode: use local /api/* routes (Vite proxies to DaaS)
    const url = `/api/fields/${collection}?_t=${Date.now()}`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) {
      const text = await response.text();
      console.error('[DaaS API] Error response:', text);
      throw new Error(`API Error: ${response.status} - ${text}`);
    }
    const data = await response.json();
    return data.data || [];
  } else {
    // Direct mode: call DaaS directly (may have CORS issues)
    const response = await fetch(`${config.url}/fields/${collection}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DaaS API Error: ${response.status} - ${text}`);
    }
    
    const data = await response.json();
    return data.data || [];
  }
}

/**
 * Fetch collections - uses proxy in proxy mode, direct fetch otherwise
 */
async function fetchCollectionsFromDaaS(config?: DaaSConfig): Promise<string[]> {
  if (PROXY_MODE_ENABLED || !config) {
    // Proxy mode: use local /api/* routes
    const response = await fetch(`/api/collections`);
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }
    const data = await response.json();
    return (data.data || [])
      .map((c: any) => c.collection)
      .filter((name: string) => !name.startsWith('directus_'));
  } else {
    // Direct mode: call DaaS directly
    const response = await fetch(`${config.url}/collections`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.data || [])
      .map((c: any) => c.collection)
      .filter((name: string) => !name.startsWith('directus_'));
  }
}

// ============================================================================
// DaaS Connection Component
// ============================================================================

interface DaaSConnectionProps {
  onFieldsLoaded: (fields: Field[], collection: string) => void;
  onConfigChange: (config: DaaSConfig | null) => void;
}

const DaaSConnection: React.FC<DaaSConnectionProps> = ({ onFieldsLoaded, onConfigChange }) => {
  // In proxy mode, we don't need URL/token - they're handled by Vite proxy
  const [collection, setCollection] = useState(() => 
    localStorage.getItem('storybook_daas_collection') || 'interface_showcase'
  );
  
  // Direct mode state (only used when proxy mode is disabled)
  const [daasUrl, setDaasUrl] = useState(() => 
    localStorage.getItem('storybook_daas_url') || ''
  );
  const [daasToken, setDaasToken] = useState(() => 
    localStorage.getItem('storybook_daas_token') || ''
  );
  
  // Don't start as connected - we need to verify the proxy works
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [fields, setFields] = useState<Field[]>([]);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('storybook_daas_collection', collection);
    if (!PROXY_MODE_ENABLED) {
      localStorage.setItem('storybook_daas_url', daasUrl);
      localStorage.setItem('storybook_daas_token', daasToken);
    }
  }, [daasUrl, daasToken, collection]);

  // Auto-connect in proxy mode on mount
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
      // Test connection by fetching collections via proxy
      const collectionList = await fetchCollectionsFromDaaS();
      setCollections(collectionList);
      setIsConnected(true);
      
      // In proxy mode, don't set global config - use /api/* routes directly
      // The proxy handles auth
      onConfigChange(null);
      
      // Auto-load fields if collection is set
      if (collection && collectionList.includes(collection)) {
        await loadFieldsProxy(collection);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proxy connection failed');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [collection, onConfigChange]);

  const connectDirect = useCallback(async () => {
    if (!daasUrl || !daasToken) {
      setError('Please enter DaaS URL and Token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test connection by fetching collections directly
      const config: DaaSConfig = { url: daasUrl, token: daasToken };
      const collectionList = await fetchCollectionsFromDaaS(config);
      setCollections(collectionList);
      setIsConnected(true);
      
      // Set global DaaS config for services/hooks to use
      setGlobalDaaSConfig(config);
      onConfigChange(config);
      
      // Auto-load fields if collection is set
      if (collection && collectionList.includes(collection)) {
        await loadFieldsDirect(config, collection);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. CORS may be blocking the request.');
      setIsConnected(false);
      setGlobalDaaSConfig(null);
      onConfigChange(null);
    } finally {
      setIsLoading(false);
    }
  }, [daasUrl, daasToken, collection, onConfigChange]);

  const loadFieldsProxy = async (collectionName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedFields = await fetchFieldsFromDaaS(collectionName);
      setFields(loadedFields);
      onFieldsLoaded(loadedFields, collectionName);
    } catch (err) {
      console.error('[DaaS Playground] Error loading fields:', err);
      setError(err instanceof Error ? err.message : 'Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFieldsDirect = async (config: DaaSConfig, collectionName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedFields = await fetchFieldsFromDaaS(collectionName, config);
      setFields(loadedFields);
      onFieldsLoaded(loadedFields, collectionName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadCollection = async () => {
    if (!collection) {
      setError('Please enter a collection name');
      return;
    }
    if (PROXY_MODE_ENABLED) {
      await loadFieldsProxy(collection);
    } else {
      await loadFieldsDirect({ url: daasUrl, token: daasToken }, collection);
    }
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
          <Alert color="green" title="Proxy Mode Active">
            <Text size="sm">
              Storybook is configured with DaaS proxy via environment variables.
              All <Code>/api/*</Code> requests are forwarded to your DaaS instance.
            </Text>
            <Text size="xs" c="dimmed" mt="xs">
              No CORS issues - the proxy handles authentication automatically.
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
pnpm storybook:form`}
              </Code>
            </Alert>

            <TextInput
              label="DaaS URL"
              placeholder="https://xxx.microbuild-daas.xtremax.com"
              value={daasUrl}
              onChange={(e) => setDaasUrl(e.target.value)}
              description="Your DaaS instance URL (without /api prefix)"
            />

            <TextInput
              label="Static Token"
              placeholder="Enter your static token..."
              value={daasToken}
              onChange={(e) => setDaasToken(e.target.value)}
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
            <Divider label="Load Collection" labelPosition="center" />
            
            {collections.length > 0 ? (
              <Select
                label="Collection"
                placeholder="Select a collection..."
                data={collections}
                value={collection}
                onChange={(val) => setCollection(val || '')}
                searchable
                description={`${collections.length} collections available`}
              />
            ) : (
              <TextInput
                label="Collection Name"
                placeholder="e.g., interface_showcase"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              />
            )}

            <Group>
              <Button
                onClick={handleLoadCollection}
                loading={isLoading}
                leftSection={<IconCloudDownload size={16} />}
                disabled={!collection}
              >
                Load Fields
              </Button>
              
              {fields.length > 0 && (
                <Button
                  variant="light"
                  onClick={handleLoadCollection}
                  leftSection={<IconRefresh size={16} />}
                >
                  Refresh
                </Button>
              )}
            </Group>

            {fields.length > 0 && (
              <Alert color="green" title={`Loaded ${fields.length} fields from "${collection}"`}>
                <Code block style={{ fontSize: '11px', maxHeight: '100px', overflow: 'auto' }}>
                  {fields.map(f => `${f.field} (${f.type} → ${f.meta?.interface || 'auto'})`).join('\n')}
                </Code>
              </Alert>
            )}
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
// DaaS Connected Story
// ============================================================================

const DaaSPlayground: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [collection, setCollection] = useState<string>('');
  const [values, setValues] = useState<FieldValues>({});
  const [daasConfig, setDaasConfig] = useState<ServiceDaaSConfig | null>(null);

  const handleFieldsLoaded = (loadedFields: Field[], collectionName: string) => {
    setFields(loadedFields);
    setCollection(collectionName);
    setValues({});
  };

  const handleConfigChange = (config: DaaSConfig | null) => {
    // Convert to service DaaSConfig type (they're the same structure)
    setDaasConfig(config as ServiceDaaSConfig | null);
  };

  return (
    <DaaSProvider config={daasConfig}>
      <Stack gap="lg">
        <DaaSConnection onFieldsLoaded={handleFieldsLoaded} onConfigChange={handleConfigChange} />

        {fields.length > 0 ? (
          <>
            <Paper p="md" withBorder>
              <Text fw={600} mb="md">📝 Form: {collection}</Text>
              <VForm
                fields={fields}
                modelValue={values}
                onUpdate={setValues}
                primaryKey="+"
                collection={collection}
              />
            </Paper>

            <Paper p="md" withBorder>
              <Text fw={600} mb="sm">Current Form Values:</Text>
              <Code block style={{ fontSize: '12px' }}>
                {JSON.stringify(values, null, 2)}
              </Code>
            </Paper>
          </>
        ) : (
          <Alert color="blue" title={PROXY_MODE_ENABLED ? "Select a Collection" : "Connect to DaaS"}>
            <Text size="sm">
              {PROXY_MODE_ENABLED 
                ? "Proxy mode is active. Select a collection from the dropdown above to load its fields."
                : "Enter your DaaS URL and static token above, then load a collection to see the form."
              }
            </Text>
            <Text size="sm" mt="xs">
              <strong>Tip:</strong> The <Code>interface_showcase</Code> collection has diverse field types including relational fields.
            </Text>
          </Alert>
        )}
      </Stack>
    </DaaSProvider>
  );
};

/**
 * DaaS Connected Playground
 * 
 * Connect to a real DaaS instance and test VForm with actual collection schemas.
 */
export const Playground: StoryObj<typeof VForm> = {
  render: () => <DaaSPlayground />,
  parameters: {
    docs: {
      description: {
        story: `
## Proxy Mode (Recommended)

Start Storybook with environment variables to enable DaaS proxy:

\`\`\`bash
STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \\
STORYBOOK_DAAS_TOKEN=your-static-token \\
pnpm storybook:form
\`\`\`

This enables a Vite proxy that forwards \`/api/*\` requests to DaaS, avoiding CORS issues.
All relational interfaces (M2O, O2M, M2M, M2A) will work correctly in this mode.

## Direct Mode (Manual Entry)

If you don't use environment variables, you can enter DaaS URL and token manually.
Note: This may encounter CORS issues as the browser makes direct requests to DaaS.

## Getting a Static Token

1. Log into DaaS as admin
2. Go to **Users** → Edit your user
3. Scroll to **Token** field → Click **Generate Token**
4. **Copy the token** (it won't be shown again!)
5. Click **Save**

## Security Note

In direct mode, your token is stored in localStorage. Clear it after testing:
\`\`\`js
localStorage.removeItem('storybook_daas_token');
\`\`\`
        `,
      },
    },
  },
};
