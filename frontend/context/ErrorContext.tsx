'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  duration?: number; // auto-dismiss after ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (error: Omit<ErrorMessage, 'id'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * Error Provider component to manage global error state
 */
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const addError = useCallback(
    (error: Omit<ErrorMessage, 'id'>): string => {
      const id = `error-${Date.now()}-${Math.random()}`;
      const newError: ErrorMessage = {
        ...error,
        id,
        dismissible: error.dismissible ?? true,
      };

      setErrors((prev) => [...prev, newError]);

      // Auto-dismiss if duration is set
      if (error.duration) {
        setTimeout(() => {
          removeError(id);
        }, error.duration);
      }

      return id;
    },
    []
  );

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        removeError,
        clearErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
}

/**
 * Hook to access error context
 */
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}

/**
 * Error display component for showing errors
 */
export function ErrorDisplay() {
  const { errors, removeError } = useError();

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-md">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`p-4 rounded-lg shadow-lg text-white flex items-start justify-between gap-3 ${
            error.type === 'error'
              ? 'bg-red-500'
              : error.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{error.message}</p>
            {error.action && (
              <button
                onClick={error.action.onClick}
                className="mt-2 text-xs font-semibold underline hover:no-underline"
              >
                {error.action.label}
              </button>
            )}
          </div>
          {error.dismissible && (
            <button
              onClick={() => removeError(error.id)}
              className="text-xl font-bold hover:opacity-75 flex-shrink-0"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
