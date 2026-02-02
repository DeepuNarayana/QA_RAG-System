import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorProvider, ErrorDisplay } from '@/context/ErrorContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Header from '@/components/Header';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorProvider>
      <AuthProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <Header />
            <Component {...pageProps} />
            <ErrorDisplay />
          </QueryClientProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ErrorProvider>
  );
}
