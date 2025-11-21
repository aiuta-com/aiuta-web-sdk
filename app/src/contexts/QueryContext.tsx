import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Global QueryClient instance
 * Configured with sensible defaults for storage operations
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus (useful for multi-tab scenarios)
      refetchOnWindowFocus: false,
      // Retry failed queries
      retry: 1,
      // Cache time
      gcTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 1 * 60 * 1000, // 1 minute
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

/**
 * Query provider wrapper for React Query
 * Provides QueryClient to all child components
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
