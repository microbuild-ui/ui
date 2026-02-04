import React, { useState, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput, PasswordInput, Button, Stack, Alert, Code, Group, Text, Paper, Badge, Divider, Select, Switch, Accordion, Tabs, ActionIcon, Tooltip } from '@mantine/core';
import { IconPlugConnected, IconPlugConnectedX, IconRefresh, IconCloudDownload, IconServer, IconUser, IconShield, IconLock, IconLogin, IconLogout, IconKey } from '@tabler/icons-react';
import { VForm } from './VForm';
import type { Field } from '@microbuild/types';
import type { FieldValues } from './types';
import { setGlobalDaaSConfig, DaaSProvider, useDaaSContext, type DaaSConfig as ServiceDaaSConfig } from '@microbuild/services';

/**
 * VForm - DaaS Connected Playground
 * 
 * This story connects to a real DaaS instance to fetch fields and test
 * the VForm component with actual collection schemas.
 * 
 * ## Authentication Architecture (DaaS-Compatible)
 * 
 * The playground supports the same authentication methods as DaaS:
 * 1. **Static Tokens** - For programmatic access (Directus-style)
 * 2. **Proxy Mode** - Uses Vite proxy with environment variables
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
 * ## Permission Enforcement
 * 
 * Enable `enforcePermissions` to see only fields you have permission to access.
 * This mirrors the server-side permission enforcement in DaaS.
 * 
 * ## How It Works
 * - Authenticates using static token (Bearer header)
 * - Fetches current user from `/api/users/me`
 * - Fetches fields from `/api/fields/{collection}` (proxied or direct)
 * - Optionally fetches permissions from `/api/permissions/{collection}`
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
        component: 'Connect VForm to a real DaaS instance and test with actual collection schemas. Features authentication state display and permission enforcement.',
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
// Session Token Management (for login-based auth)
// ============================================================================

interface SessionData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    admin_access?: boolean;
    status?: string;
  };
}

// Store session in memory (not localStorage for security in Storybook)
let currentSession: SessionData | null = null;

function getSession(): SessionData | null {
  // Also check sessionStorage as a backup
  if (!currentSession) {
    const stored = sessionStorage.getItem('storybook_daas_session');
    if (stored) {
      try {
        currentSession = JSON.parse(stored);
      } catch {
        // Ignore parse errors
      }
    }
  }
  return currentSession;
}

function setSession(session: SessionData | null) {
  currentSession = session;
  if (session) {
    sessionStorage.setItem('storybook_daas_session', JSON.stringify(session));
  } else {
    sessionStorage.removeItem('storybook_daas_session');
  }
}

function getAuthHeader(): Record<string, string> {
  const session = getSession();
  if (session?.accessToken) {
    return { 'Authorization': `Bearer ${session.accessToken}` };
  }
  return {};
}

// ============================================================================
// DaaS API Helper - Supports both proxy and direct modes
// ============================================================================

interface DaaSConfig {
  url: string;
  token: string;
}

/**
 * Fetch fields - uses proxy in proxy mode, direct fetch otherwise
 * Supports both static token and login-based JWT authentication
 */
async function fetchFieldsFromDaaS(collection: string, config?: DaaSConfig): Promise<Field[]> {
  if (PROXY_MODE_ENABLED || !config) {
    // Proxy mode: use local /api/* routes (Vite proxies to DaaS)
    // If we have a session token, include it (overrides proxy's static token)
    const url = `/api/fields/${collection}?_t=${Date.now()}`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        ...getAuthHeader(),
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
 * Supports both static token and login-based JWT authentication
 */
async function fetchCollectionsFromDaaS(config?: DaaSConfig): Promise<string[]> {
  if (PROXY_MODE_ENABLED || !config) {
    // Proxy mode: use local /api/* routes
    // If we have a session token, include it (overrides proxy's static token)
    const response = await fetch(`/api/collections`, {
      headers: {
        ...getAuthHeader(),
      },
    });
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
// Login Form Component
// ============================================================================

interface LoginFormProps {
  onLoginSuccess: (session: SessionData) => void;
  onLogout: () => void;
  session: SessionData | null;
}

/**
 * Login form that authenticates with DaaS using email/password
 * Returns a JWT access token for subsequent API requests
 */
const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onLogout, session }) => {
  const [email, setEmail] = useState(() => localStorage.getItem('storybook_login_email') || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save email to localStorage for convenience (not password!)
  useEffect(() => {
    if (email) {
      localStorage.setItem('storybook_login_email', email);
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the DaaS login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        // Server returned HTML instead of JSON - likely a server error or 503
        const text = await response.text();
        if (text.includes('503') || text.includes('Service Temporarily Unavailable')) {
          throw new Error('DaaS server is unavailable (503). Please check if the server is running.');
        }
        if (text.includes('404') || text.includes('not found')) {
          throw new Error('Login endpoint not found (404). The /api/auth/login route may not exist on this DaaS instance.');
        }
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
      }

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.errors?.[0]?.message || `Login failed: ${response.status}`;
        throw new Error(errorMsg);
      }

      if (!result.data?.access_token) {
        throw new Error('No access token in response');
      }

      // Create session from response
      const newSession: SessionData = {
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
        expiresAt: result.data.expires_at,
        user: {
          id: result.data.user.id,
          email: result.data.user.email,
          first_name: result.data.user.first_name,
          last_name: result.data.user.last_name,
          admin_access: result.data.user.admin_access,
          status: result.data.user.status,
        },
      };

      // Store session and notify parent
      setSession(newSession);
      onLoginSuccess(newSession);
      setPassword(''); // Clear password from memory
      
    } catch (err) {
      console.error('[Login] Error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setPassword('');
    onLogout();
  };

  // If already logged in, show user info
  if (session) {
    return (
      <Paper p="sm" withBorder>
        <Group justify="space-between">
          <Group gap="sm">
            <IconUser size={20} />
            <div>
              <Group gap="xs">
                <Text size="sm" fw={600}>
                  {session.user.first_name || ''} {session.user.last_name || session.user.email}
                </Text>
                {session.user.admin_access && (
                  <Badge color="green" size="xs" leftSection={<IconShield size={10} />}>
                    Admin
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">{session.user.email}</Text>
            </div>
          </Group>
          <Tooltip label="Logout">
            <ActionIcon variant="light" color="red" onClick={handleLogout}>
              <IconLogout size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <form onSubmit={handleLogin}>
        <Stack gap="sm">
          <Group gap="xs">
            <IconLogin size={20} />
            <Text fw={600}>Login with Email & Password</Text>
          </Group>
          
          <Text size="sm" c="dimmed">
            Authenticate with your DaaS credentials to get a JWT access token.
          </Text>

          <TextInput
            label="Email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftSection={<IconUser size={16} />}
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftSection={<IconKey size={16} />}
            autoComplete="current-password"
          />

          {error && (
            <Alert color="red" title="Login Failed">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            loading={isLoading}
            leftSection={<IconLogin size={16} />}
            disabled={!email || !password}
          >
            Login
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

// ============================================================================
// DaaS Connection Component
// ============================================================================

interface DaaSConnectionProps {
  onFieldsLoaded: (fields: Field[], collection: string) => void;
  onConfigChange: (config: DaaSConfig | null) => void;
  session: SessionData | null;
  onSessionChange: (session: SessionData | null) => void;
}

const DaaSConnection: React.FC<DaaSConnectionProps> = ({ 
  onFieldsLoaded, 
  onConfigChange,
  session,
  onSessionChange,
}) => {
  // In proxy mode, we don't need URL/token - they're handled by Vite proxy
  const [collection, setCollection] = useState(() => 
    localStorage.getItem('storybook_daas_collection') || 'interface_showcase'
  );
  
  // Auth tab: 'login' for email/password, 'token' for static token
  const [authTab, setAuthTab] = useState<string | null>(() => 
    localStorage.getItem('storybook_auth_tab') || 'login'
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
    if (authTab) {
      localStorage.setItem('storybook_auth_tab', authTab);
    }
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
          <>
            <Alert color="green" title="Proxy Mode Active">
              <Text size="sm">
                Storybook is configured with DaaS proxy via environment variables.
                All <Code>/api/*</Code> requests are forwarded to your DaaS instance.
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                No CORS issues - the proxy handles authentication automatically.
              </Text>
            </Alert>

            {/* Authentication Options */}
            <Tabs value={authTab} onChange={setAuthTab}>
              <Tabs.List>
                <Tabs.Tab value="login" leftSection={<IconLogin size={14} />}>
                  Login
                </Tabs.Tab>
                <Tabs.Tab value="token" leftSection={<IconKey size={14} />}>
                  Static Token
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="login" pt="md">
                <LoginForm
                  session={session}
                  onLoginSuccess={(newSession) => {
                    onSessionChange(newSession);
                    // Auto-connect after login
                    connectProxy();
                  }}
                  onLogout={() => {
                    onSessionChange(null);
                    setIsConnected(false);
                    setCollections([]);
                    setFields([]);
                  }}
                />
              </Tabs.Panel>

              <Tabs.Panel value="token" pt="md">
                <Alert color="blue" icon={<IconKey size={16} />}>
                  <Text size="sm">
                    Using static token from environment variable. The proxy adds 
                    the token to all <Code>/api/*</Code> requests automatically.
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs">
                    To use a different token, login with email/password above.
                  </Text>
                </Alert>
              </Tabs.Panel>
            </Tabs>
          </>
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

/**
 * Auth Status Display Component
 */
const AuthStatus: React.FC = () => {
  const { user, isAdmin, authLoading, authError } = useDaaSContext();
  
  if (authLoading) {
    return (
      <Paper p="sm" withBorder>
        <Group gap="xs">
          <IconUser size={16} />
          <Text size="sm" c="dimmed">Loading user...</Text>
        </Group>
      </Paper>
    );
  }
  
  if (authError) {
    return (
      <Alert color="red" icon={<IconLock size={16} />} title="Auth Error">
        {authError}
      </Alert>
    );
  }
  
  if (!user) {
    return (
      <Alert color="yellow" icon={<IconUser size={16} />} title="Not Authenticated">
        Connect to DaaS to see authentication status.
      </Alert>
    );
  }
  
  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between">
        <Group gap="sm">
          <IconUser size={20} />
          <div>
            <Text size="sm" fw={600}>
              {user.first_name} {user.last_name}
            </Text>
            <Text size="xs" c="dimmed">{user.email}</Text>
          </div>
        </Group>
        <Group gap="xs">
          {isAdmin && (
            <Badge color="green" leftSection={<IconShield size={10} />}>
              Admin
            </Badge>
          )}
          <Badge color={user.status === 'active' ? 'blue' : 'gray'}>
            {user.status}
          </Badge>
        </Group>
      </Group>
    </Paper>
  );
};

const DaaSPlayground: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [collection, setCollection] = useState<string>('');
  const [values, setValues] = useState<FieldValues>({});
  const [daasConfig, setDaasConfig] = useState<ServiceDaaSConfig | null>(null);
  const [enforcePermissions, setEnforcePermissions] = useState(false);
  const [formAction, setFormAction] = useState<'create' | 'update' | 'read'>('create');
  const [accessibleFields, setAccessibleFields] = useState<string[]>([]);
  
  // Session state for login-based auth
  const [session, setSessionState] = useState<SessionData | null>(() => getSession());

  const handleFieldsLoaded = (loadedFields: Field[], collectionName: string) => {
    setFields(loadedFields);
    setCollection(collectionName);
    setValues({});
    setAccessibleFields([]);
  };

  const handleConfigChange = (config: DaaSConfig | null) => {
    // Convert to service DaaSConfig type (they're the same structure)
    setDaasConfig(config as ServiceDaaSConfig | null);
  };
  
  const handleSessionChange = (newSession: SessionData | null) => {
    setSessionState(newSession);
    setSession(newSession); // Also update the global session
  };
  
  const handlePermissionsLoaded = (fields: string[]) => {
    setAccessibleFields(fields);
  };

  return (
    <DaaSProvider config={daasConfig}>
      <Stack gap="lg">
        <DaaSConnection 
          onFieldsLoaded={handleFieldsLoaded} 
          onConfigChange={handleConfigChange}
          session={session}
          onSessionChange={handleSessionChange}
        />
        
        {/* Auth Status - Shows current user info from session or context */}
        {session ? (
          <Paper p="sm" withBorder>
            <Group justify="space-between">
              <Group gap="sm">
                <IconUser size={20} />
                <div>
                  <Group gap="xs">
                    <Text size="sm" fw={600}>
                      {session.user.first_name || ''} {session.user.last_name || session.user.email}
                    </Text>
                    {session.user.admin_access && (
                      <Badge color="green" size="xs" leftSection={<IconShield size={10} />}>
                        Admin
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">{session.user.email}</Text>
                </div>
              </Group>
              <Badge color="blue">
                {session.user.status || 'authenticated'}
              </Badge>
            </Group>
          </Paper>
        ) : (PROXY_MODE_ENABLED || daasConfig) && <AuthStatus />}

        {fields.length > 0 ? (
          <>
            {/* Permission Settings */}
            <Accordion>
              <Accordion.Item value="permissions">
                <Accordion.Control icon={<IconShield size={16} />}>
                  Permission Settings
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="md">
                    <Switch
                      label="Enforce Field Permissions"
                      description="When enabled, only fields you have permission to access will be shown. This mirrors server-side permission enforcement."
                      checked={enforcePermissions}
                      onChange={(e) => setEnforcePermissions(e.currentTarget.checked)}
                    />
                    
                    <Select
                      label="Form Action"
                      description="The action type determines which permissions are checked"
                      data={[
                        { value: 'create', label: 'Create - Check create permissions' },
                        { value: 'update', label: 'Update - Check update permissions' },
                        { value: 'read', label: 'Read - Check read permissions' },
                      ]}
                      value={formAction}
                      onChange={(val) => setFormAction(val as 'create' | 'update' | 'read')}
                    />
                    
                    {enforcePermissions && accessibleFields.length > 0 && (
                      <Alert color="blue" icon={<IconShield size={16} />}>
                        <Text size="sm" fw={600}>
                          {accessibleFields.includes('*') 
                            ? 'Full field access (admin or wildcard permission)'
                            : `${accessibleFields.length} fields accessible for ${formAction}`
                          }
                        </Text>
                        {!accessibleFields.includes('*') && (
                          <Code block style={{ fontSize: '11px', marginTop: '8px' }}>
                            {accessibleFields.join(', ')}
                          </Code>
                        )}
                      </Alert>
                    )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            
            <Paper p="md" withBorder>
              <Text fw={600} mb="md">📝 Form: {collection}</Text>
              <VForm
                fields={fields}
                modelValue={values}
                onUpdate={setValues}
                primaryKey={formAction === 'create' ? '+' : '1'}
                collection={collection}
                action={formAction}
                enforcePermissions={enforcePermissions}
                onPermissionsLoaded={handlePermissionsLoaded}
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
 * Features authentication state display and permission enforcement.
 */
export const Playground: StoryObj<typeof VForm> = {
  render: () => <DaaSPlayground />,
  parameters: {
    docs: {
      description: {
        story: `
## Authentication Architecture

This playground follows the DaaS authentication architecture:

1. **Static Tokens** - Long-lived tokens for programmatic access (Directus-style)
2. **Cookie Sessions** - For browser requests (automatic in Next.js apps)
3. **JWT Bearer Tokens** - For API clients with Supabase Auth

### Proxy Mode (Recommended)

Start Storybook with environment variables to enable DaaS proxy:

\`\`\`bash
STORYBOOK_DAAS_URL=https://xxx.microbuild-daas.xtremax.com \\
STORYBOOK_DAAS_TOKEN=your-static-token \\
pnpm storybook:form
\`\`\`

This enables a Vite proxy that forwards \`/api/*\` requests to DaaS, avoiding CORS issues.
All relational interfaces (M2O, O2M, M2M, M2A) will work correctly in this mode.

### Direct Mode (Manual Entry)

If you don't use environment variables, you can enter DaaS URL and token manually.
Note: This may encounter CORS issues as the browser makes direct requests to DaaS.

## Permission Enforcement

Enable "Enforce Field Permissions" to see only fields you have permission to access.
This mirrors the server-side permission enforcement in DaaS:

- **Field-Level Permissions**: Only show fields the user can access
- **Action-Based Filtering**: Different fields for create vs update vs read
- **Admin Bypass**: Admins see all fields regardless of permissions

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
