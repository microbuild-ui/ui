/**
 * useDaaSContext Hook
 * 
 * Client-side hook to access DaaS configuration from React context.
 * Re-exports the context hook from @microbuild/services for use in hooks package.
 * 
 * @module @microbuild/hooks/useDaaSContext
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * DaaS Configuration
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

// Create context
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
 * Provides DaaS configuration to hooks and components.
 * When configured with URL and token, API calls go directly to DaaS
 * instead of using Next.js proxy routes.
 * 
 * @example
 * ```tsx
 * // In Storybook or testing environment
 * <DaaSProvider config={{ url: 'https://xxx.microbuild-daas.xtremax.com', token: 'xxx' }}>
 *   <App />
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
          const baseUrl = config.url.replace(/\/$/, '');
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          const daasPath = cleanPath.replace(/^\/api/, '');
          return `${baseUrl}${daasPath}`;
        }
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
 * useDaaSContext - Hook to access DaaS context
 * 
 * Returns the DaaS configuration and helpers.
 * Falls back to proxy mode behavior if not inside a DaaSProvider.
 * 
 * @example
 * ```tsx
 * const { config, isDirectMode, buildUrl, getHeaders } = useDaaSContext();
 * 
 * // Make API request
 * const url = buildUrl('/api/users/me');
 * const response = await fetch(url, { headers: getHeaders() });
 * ```
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
 * useIsDirectDaaSMode - Check if direct DaaS mode is enabled
 */
export function useIsDirectDaaSMode(): boolean {
  const context = useDaaSContext();
  return context.isDirectMode;
}

export default useDaaSContext;
