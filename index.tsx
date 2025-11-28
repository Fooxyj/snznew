import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Optimization: Configure cache defaults to reduce Disk IO
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes (no refetching)
      gcTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus to save bandwidth/IO
      retry: 1,
    },
  },
});

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);