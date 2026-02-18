'use client';

import { useCallback, useMemo } from 'react';

export interface UseClipboardOptions {
  /** Success message for copy operation */
  copySuccessMessage?: string;
  /** Failure message for copy operation */
  copyFailMessage?: string;
  /** Success message for paste operation */
  pasteSuccessMessage?: string;
  /** Failure message for paste operation */
  pasteFailMessage?: string;
  /** Callback for notifications */
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

export interface UseClipboardReturn {
  /** Whether the copy operation is supported */
  isCopySupported: boolean;
  /** Whether the paste operation is supported */
  isPasteSupported: boolean;
  /** Copy a value to clipboard */
  copyToClipboard: (value: unknown) => Promise<boolean>;
  /** Paste a value from clipboard */
  pasteFromClipboard: () => Promise<string | null>;
}

/**
 * Hook for clipboard operations with notifications
 * Ported from DaaS useClipboard composable for React
 * 
 * @example
 * ```tsx
 * import { notifications } from '@mantine/notifications';
 * 
 * const { copyToClipboard, pasteFromClipboard } = useClipboard({
 *   onNotify: (message, type) => {
 *     notifications.show({ 
 *       message, 
 *       color: type === 'error' ? 'red' : 'green' 
 *     });
 *   }
 * });
 * 
 * // Copy value
 * await copyToClipboard({ id: 1, name: 'Item' });
 * 
 * // Paste value
 * const pasted = await pasteFromClipboard();
 * ```
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const {
    copySuccessMessage = 'Copied to clipboard',
    copyFailMessage = 'Failed to copy to clipboard',
    pasteSuccessMessage = 'Pasted from clipboard',
    pasteFailMessage = 'Failed to paste from clipboard',
    onNotify,
  } = options;

  const isCopySupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!navigator?.clipboard?.writeText;
  }, []);

  const isPasteSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!navigator?.clipboard?.readText;
  }, []);

  const copyToClipboard = useCallback(async (value: unknown): Promise<boolean> => {
    try {
      const valueString = typeof value === 'string' ? value : JSON.stringify(value);
      await navigator.clipboard.writeText(valueString);
      
      onNotify?.(copySuccessMessage, 'success');
      return true;
    } catch {
      onNotify?.(copyFailMessage, 'error');
      return false;
    }
  }, [copySuccessMessage, copyFailMessage, onNotify]);

  const pasteFromClipboard = useCallback(async (): Promise<string | null> => {
    try {
      const pasteValue = await navigator?.clipboard?.readText();
      
      onNotify?.(pasteSuccessMessage, 'success');
      return pasteValue;
    } catch {
      onNotify?.(pasteFailMessage, 'error');
      return null;
    }
  }, [pasteSuccessMessage, pasteFailMessage, onNotify]);

  return {
    isCopySupported,
    isPasteSupported,
    copyToClipboard,
    pasteFromClipboard,
  };
}
