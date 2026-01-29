'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * DaaS Configuration
 * 
 * Configuration for direct DaaS API access (bypassing Next.js proxy routes).
 * Used in environments like Storybook where proxy routes don't exist.
 */
export interface DaaSConfig {
  /** DaaS API base URL (e.g., https://xxx.microbuild-daas.xtremax.com) */
  url: string;
  /** Static authentication token for API access */
  token: string;
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
}

const DaaSContext = createContext<DaaSContextValue | null>(null);

/**
 * DaaSProvider Props
 */
export interface DaaSProviderProps {
  /** DaaS configuration for direct API access */
  config?: DaaSConfig | null;
  /** Children */
  children: ReactNode;
}

/**
 * DaaSProvider
 * 
 * Provides DaaS configuration to services and hooks.
 * When configured with URL and token, services will call DaaS directly
 * instead of using Next.js proxy routes.
 * 
 * @example
 * ```tsx
 * // In Storybook or testing environment
 * <DaaSProvider config={{ url: 'https://xxx.microbuild-daas.xtremax.com', token: 'xxx' }}>
 *   <VForm collection="articles" />
 * </DaaSProvider>
 * 
 * // In Next.js app (uses proxy routes)
 * <DaaSProvider>
 *   <VForm collection="articles" />
 * </DaaSProvider>
 * ```
 */
export function DaaSProvider({ config, children }: DaaSProviderProps) {
  const value = useMemo<DaaSContextValue>(() => {
    const isDirectMode = Boolean(config?.url && config?.token);
    
    return {
      config: config ?? null,
      isDirectMode,
      buildUrl: (path: string) => {
        if (isDirectMode && config) {
          // Direct mode: use full DaaS URL
          const baseUrl = config.url.replace(/\/$/, '');
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          // Convert /api/xxx to DaaS format
          // e.g., /api/fields/articles -> /fields/articles
          const daasPath = cleanPath.replace(/^\/api/, '');
          return `${baseUrl}${daasPath}`;
        }
        // Proxy mode: use local API routes
        return path;
      },
      getHeaders: (): Record<string, string> => {
        if (isDirectMode && config) {
          return {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json',
          };
        }
        return {
          'Content-Type': 'application/json',
        };
      },
    };
  }, [config]);

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
