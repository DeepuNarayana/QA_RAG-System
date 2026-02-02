import { useError } from '@/context/ErrorContext';
import { useCallback } from 'react';

/**
 * Hook for handling API errors globally
 * Shows error messages and provides retry capability
 */
export function useErrorHandler() {
  const { addError } = useError();

  const handleError = useCallback(
    (error: unknown, defaultMessage: string = 'An error occurred') => {
      let message = defaultMessage;

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = (error as any).message;
      }

      addError({
        message,
        type: 'error',
        duration: 5000, // Auto-dismiss after 5s
      });
    },
    [addError]
  );

  return { handleError };
}

/**
 * Hook for wrapping React Query mutations with error handling
 * Provides typed error handling for async operations
 */
export function useMutationWithError<TData, TError = unknown>(
  mutationFn: () => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
    errorMessage?: string;
  }
) {
  const { addError } = useError();
  const loading = false;
  const error = null;
  const data = null;

  const mutate = useCallback(async () => {
    try {
      const result = await mutationFn();
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorObj = err as TError;
      options?.onError?.(errorObj);

      addError({
        message:
          options?.errorMessage ||
          (err instanceof Error ? err.message : 'An error occurred'),
        type: 'error',
        duration: 5000,
      });

      throw err;
    }
  }, [mutationFn, addError, options]);

  return {
    mutate,
    loading,
    error,
    data,
  };
}

/**
 * Hook for handling fetch errors with retry capability
 */
export function useApiCall<T>(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  }
) {
  const { addError } = useError();

  const execute = useCallback(async (): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}`
        );
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'API call failed';
      addError({
        message,
        type: 'error',
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => execute(),
        },
      });

      throw err;
    }
  }, [url, options, addError]);

  return { execute };
}
