import React, { useState, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput, Button, Stack, Alert, Code, Group, Text, Paper, Badge, Divider } from '@mantine/core';
import { IconPlugConnected, IconPlugConnectedX, IconRefresh, IconCloudDownload } from '@tabler/icons-react';
import { VForm } from './VForm';
import type { Field } from '@microbuild/types';
import type { FieldValues } from './types';

/**
 * VForm - DaaS Connected Playground
 * 
 * This story connects to a real DaaS instance to fetch fields and test
 * the VForm component with actual collection schemas.
 * 
 * ## Setup
 * 1. Get your DaaS URL (e.g., https://xxx.microbuild-daas.xtremax.com)
 * 2. Create a static token in DaaS:
 *    - Go to Users → Edit your user
 *    - Click "Generate Token" and save
 *    - Copy the token (it won't be shown again)
 * 3. Enter the URL, token, and collection name below
 * 
 * ## How It Works
 * - Fetches fields from `/api/fields/{collection}` using static token auth
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
// DaaS API Helper
// ============================================================================

interface DaaSConfig {
  url: string;
  token: string;
}

async function fetchFieldsFromDaaS(config: DaaSConfig, collection: string): Promise<Field[]> {
  const response = await fetch(`${config.url}/api/fields/${collection}`, {
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

async function fetchCollectionsFromDaaS(config: DaaSConfig): Promise<string[]> {
  const response = await fetch(`${config.url}/api/collections`, {
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.status}`);
  }
  
  const data = await response.json();
  // Filter out system collections (starting with directus_)
  return (data.data || [])
    .map((c: any) => c.collection)
    .filter((name: string) => !name.startsWith('directus_'));
}

// ============================================================================
// DaaS Connection Component
// ============================================================================

interface DaaSConnectionProps {
  onFieldsLoaded: (fields: Field[], collection: string) => void;
}

const DaaSConnection: React.FC<DaaSConnectionProps> = ({ onFieldsLoaded }) => {
  // Load from localStorage if available
  const [daasUrl, setDaasUrl] = useState(() => 
    localStorage.getItem('storybook_daas_url') || ''
  );
  const [daasToken, setDaasToken] = useState(() => 
    localStorage.getItem('storybook_daas_token') || ''
  );
  const [collection, setCollection] = useState(() => 
    localStorage.getItem('storybook_daas_collection') || 'test_vform_articles'
  );
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [fields, setFields] = useState<Field[]>([]);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('storybook_daas_url', daasUrl);
    localStorage.setItem('storybook_daas_token', daasToken);
    localStorage.setItem('storybook_daas_collection', collection);
  }, [daasUrl, daasToken, collection]);

  const connect = useCallback(async () => {
    if (!daasUrl || !daasToken) {
      setError('Please enter DaaS URL and Token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test connection by fetching collections
      const config: DaaSConfig = { url: daasUrl, token: daasToken };
      const collectionList = await fetchCollectionsFromDaaS(config);
      setCollections(collectionList);
      setIsConnected(true);
      
      // Auto-load fields if collection is set
      if (collection && collectionList.includes(collection)) {
        await loadFields(config, collection);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [daasUrl, daasToken, collection]);

  const loadFields = async (config: DaaSConfig, collectionName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedFields = await fetchFieldsFromDaaS(config, collectionName);
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
    await loadFields({ url: daasUrl, token: daasToken }, collection);
  };

  return (
    <Paper p="md" withBorder mb="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">🔌 DaaS Connection</Text>
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

        <TextInput
          label="DaaS URL"
          placeholder="https://xxx.microbuild-daas.xtremax.com"
          value={daasUrl}
          onChange={(e) => setDaasUrl(e.target.value)}
          description="Your DaaS instance URL"
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
            onClick={connect}
            loading={isLoading && !isConnected}
            leftSection={<IconPlugConnected size={16} />}
            disabled={!daasUrl || !daasToken}
          >
            Connect
          </Button>
        </Group>

        {isConnected && (
          <>
            <Divider label="Load Collection" labelPosition="center" />
            
            <TextInput
              label="Collection Name"
              placeholder="e.g., test_vform_articles"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              description={collections.length > 0 ? `Available: ${collections.slice(0, 5).join(', ')}${collections.length > 5 ? '...' : ''}` : undefined}
            />

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

  const handleFieldsLoaded = (loadedFields: Field[], collectionName: string) => {
    setFields(loadedFields);
    setCollection(collectionName);
    setValues({});
  };

  return (
    <Stack gap="lg">
      <DaaSConnection onFieldsLoaded={handleFieldsLoaded} />

      {fields.length > 0 ? (
        <>
          <Paper p="md" withBorder>
            <Text fw={600} mb="md">📝 Form: {collection}</Text>
            <VForm
              fields={fields}
              modelValue={values}
              onUpdate={setValues}
              primaryKey="+"
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
        <Alert color="blue" title="Connect to DaaS">
          <Text size="sm">
            Enter your DaaS URL and static token above, then load a collection to see the form.
          </Text>
          <Text size="sm" mt="xs">
            <strong>Tip:</strong> The <Code>test_vform_articles</Code> collection has diverse field types for testing.
          </Text>
        </Alert>
      )}
    </Stack>
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
## How to Use

1. **Get your DaaS URL**: From your browser, copy the URL like \`https://xxx.microbuild-daas.xtremax.com\`

2. **Generate a Static Token**:
   - Log into DaaS as admin
   - Go to **Users** → Edit your user
   - Scroll to **Token** field → Click **Generate Token**
   - **Copy the token** (it won't be shown again!)
   - Click **Save**

3. **Connect**: Enter the URL and token above, click Connect

4. **Load a Collection**: Enter a collection name (e.g., \`test_vform_articles\`) and click Load Fields

5. **Test the Form**: The VForm will render with the collection's schema!

## Security Note

Your token is stored in localStorage for convenience. Clear it after testing:
\`\`\`js
localStorage.removeItem('storybook_daas_token');
\`\`\`
        `,
      },
    },
  },
};
