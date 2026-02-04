'use client';

import { createContext, useContext, useMemo, useState, useEffect, useCallback, type ReactNode } from 'react';

/**
 * DaaS Configuration
 * 
 * Configuration for direct DaaS API access (bypassing Next.js proxy routes).
 * Used in environments like Storybook where proxy routes don't exist.
 * 
 * Authentication Methods Supported (mirrors DaaS architecture):
 * 1. Cookie-Based Sessions - For browser requests (automatic)
 * 2. Static Tokens - For programmatic access (Directus-style)
 * 3. JWT Bearer Tokens - For API clients with Supabase Auth
 */
export interface DaaSConfig {
  /** DaaS API base URL (e.g., https://xxx.microbuild-daas.xtremax.com) */
  url: string;
  /** Static authentication token for API access */
  token: string;
}

/**
 * Authenticated user from DaaS
 */
export interface DaaSUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  status: string;
  role: string | null;
  admin_access: boolean;
  language?: string;
  theme?: string;
}

/**
 * DaaS Context Value
 */
export interface DaaSContextValue {
  /** DaaS configuration (null if using proxy routes) */
  config: DaaSConfig | null;
  /** Whether direct DaaS mode is enabled */
  isDirectMode: boolean;
  /** Build full API URL for a path */
  buildUrl: (path: string) => string;
  /** Get authorization headers */
  getHeaders: () => Record<string, string>;
  /** Current authenticated user (null if not authenticated) */
  user: DaaSUser | null;
  /** Whether user is admin */
  isAdmin: boolean;
  /** Whether auth is loading */
  authLoading: boolean;
  /** Auth error if any */
  authError: string | null;
  /** Refresh current user */
  refreshUser: () => Promise<void>;
}

const DaaSContext = createContext<DaaSContextValue | null>(null);

/**
 * DaaSProvider Props
 */
export interface DaaSProviderProps {
  /** DaaS configuration for direct API access */
  config?: DaaSConfig | null;
  /** Auto-fetch user on mount (default: true when config is provided) */
  autoFetchUser?: boolean;
  /** Callback when user is authenticated */
  onAuthenticated?: (user: DaaSUser) => void;
  /** Callback when auth fails */
  onAuthError?: (error: Error) => void;
  /** Children */
  children: ReactNode;
}

/**
 * DaaSProvider
 * 
 * Provides DaaS configuration and authentication context to services and hooks.
 * When configured with URL and token, services will call DaaS directly
 * instead of using Next.js proxy routes.
 * 
 * Authentication follows DaaS architecture:
 * - Static tokens for programmatic access (Directus-style)
 * - Cookie-based sessions for browser requests
 * - Full RBAC permissions applied at application layer
 * 
 * @example
 * ```tsx
 * // In Storybook or testing environment
 * <DaaSProvider 
 *   config={{ url: 'https://xxx.microbuild-daas.xtremax.com', token: 'xxx' }}
 *   onAuthenticated={(user) => console.log('Authenticated:', user)}
 * >
 *   <VForm collection="articles" />
 * </DaaSProvider>
 * 
 * // In Next.js app (uses proxy routes)
 * <DaaSProvider>
 *   <VForm collection="articles" />
 * </DaaSProvider>
 * ```
 */
export function DaaSProvider({ 
  config, 
  children, 
  autoFetchUser = true,
  onAuthenticated,
  onAuthError,
}: DaaSProviderProps) {
  const [user, setUser] = useState<DaaSUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isDirectMode = Boolean(config?.url && config?.token);

  // Build URL helper
  const buildUrl = useCallback((path: string): string => {
    if (isDirectMode && config) {
      const baseUrl = config.url.replace(/\/$/, '');
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      const daasPath = cleanPath.replace(/^\/api/, '');
      return `${baseUrl}${daasPath}`;
    }
    return path;
  }, [isDirectMode, config]);

  // Get headers helper
  const getHeaders = useCallback((): Record<string, string> => {
    if (isDirectMode && config) {
      return {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }, [isDirectMode, config]);

  // Fetch current user
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      
      const url = buildUrl('/api/users/me');
      const response = await fetch(url, {
        headers: getHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          return;
        }
        throw new Error(`Authentication failed: ${response.status}`);
      }
      
      const data = await response.json();
      const userData = data.data || data;
      
      setUser(userData);
      onAuthenticated?.(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(errorMessage);
      setUser(null);
      onAuthError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setAuthLoading(false);
    }
  }, [buildUrl, getHeaders, onAuthenticated, onAuthError]);

  // Auto-fetch user when config is available
  useEffect(() => {
    if (autoFetchUser && isDirectMode) {
      refreshUser();
    }
  }, [autoFetchUser, isDirectMode, config?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<DaaSContextValue>(() => ({
    config: config ?? null,
    isDirectMode,
    buildUrl,
    getHeaders,
    user,
    isAdmin: user?.admin_access ?? false,
    authLoading,
    authError,
    refreshUser,
  }), [config, isDirectMode, buildUrl, getHeaders, user, authLoading, authError, refreshUser]);

  return (
    <DaaSContext.Provider value={value}>
      {children}
    </DaaSContext.Provider>
  );
}

/**
 * Hook to access DaaS context
 * 
 * Returns null if not inside a DaaSProvider (falls back to proxy mode)
 */
export function useDaaSContext(): DaaSContextValue {
  const context = useContext(DaaSContext);
  
  // If no provider, return default (proxy mode) behavior
  if (!context) {
    return {
      config: null,
      isDirectMode: false,
      buildUrl: (path: string) => path,
      getHeaders: () => ({ 'Content-Type': 'application/json' }),
      user: null,
      isAdmin: false,
      authLoading: false,
      authError: null,
      refreshUser: async () => {},
    };
  }
  
  return context;
}

/**
 * Hook to check if direct DaaS mode is enabled
 */
export function useIsDirectDaaSMode(): boolean {
  const context = useDaaSContext();
  return context.isDirectMode;
}

// Global config for non-React contexts (e.g., services called outside components)
let globalDaaSConfig: DaaSConfig | null = null;

/**
 * Set global DaaS configuration
 * 
 * Use this to configure DaaS access in non-React contexts.
 * The React context takes precedence when available.
 */
export function setGlobalDaaSConfig(config: DaaSConfig | null) {
  globalDaaSConfig = config;
}

/**
 * Get global DaaS configuration
 */
export function getGlobalDaaSConfig(): DaaSConfig | null {
  return globalDaaSConfig;
}

/**
 * Build URL for API request (works without React context)
 */
export function buildApiUrl(path: string, config?: DaaSConfig | null): string {
  const effectiveConfig = config ?? globalDaaSConfig;
  
  if (effectiveConfig?.url && effectiveConfig?.token) {
    const baseUrl = effectiveConfig.url.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const daasPath = cleanPath.replace(/^\/api/, '');
    return `${baseUrl}${daasPath}`;
  }
  
  return path;
}

/**
 * Get headers for API request (works without React context)
 */
export function getApiHeaders(config?: DaaSConfig | null): Record<string, string> {
  const effectiveConfig = config ?? globalDaaSConfig;
  
  if (effectiveConfig?.url && effectiveConfig?.token) {
    return {
      'Authorization': `Bearer ${effectiveConfig.token}`,
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
}
