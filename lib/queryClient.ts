
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30,   // Cache is kept for 30 minutes
      refetchOnWindowFocus: false, // Prevent spamming requests when switching tabs
      retry: (failureCount, error: any) => {
        // Don't retry on client errors (400-499)
        const status = error?.status || error?.code;
        // Parse status if it's a number string
        const statusNum = Number(status);
        
        if (!isNaN(statusNum) && statusNum >= 400 && statusNum < 500) {
            return false;
        }
        
        // Supabase specific error codes for "Not Found" or "Bad Request"
        if (error?.code === 'PGRST116' || error?.code === 'PGRST100' || error?.code === '400') {
            return false;
        }

        // Limit retries for other errors (network, 500s)
        return failureCount < 1;
      },
    },
  },
});
