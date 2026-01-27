import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (except 408 timeout)
        if (typeof error === 'object' && error !== null && 'status' in error) {
          const statusError = error as { status: number }
          if (statusError.status >= 400 && statusError.status < 500 && statusError.status !== 408) {
            return false
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})