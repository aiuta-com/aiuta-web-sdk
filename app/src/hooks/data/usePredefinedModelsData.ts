import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStorageBackend } from '@/contexts'
import type { PredefinedModelCategory } from '@/utils/api'

/**
 * Query key factory for predefined models
 */
const predefinedModelsKeys = {
  cache: ['predefinedModels', 'cache'] as const,
}

/**
 * Hook to fetch cached predefined models
 */
export function usePredefinedModelsCache() {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: predefinedModelsKeys.cache,
    queryFn: () => backend.getPredefinedModels(),
  })
}

/**
 * Hook to save predefined models to cache
 */
export function useSavePredefinedModels() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      categories,
      etag,
    }: {
      categories: PredefinedModelCategory[]
      etag: string | null
    }) => backend.savePredefinedModels(categories, etag),
    onSuccess: (_, { categories, etag }) => {
      // Update cache immediately
      queryClient.setQueryData(predefinedModelsKeys.cache, {
        categories,
        etag,
      })
    },
  })
}

/**
 * Hook to clear predefined models cache
 */
export function useClearPredefinedModels() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backend.clearPredefinedModels(),
    onSuccess: () => {
      // Clear cache
      queryClient.setQueryData(predefinedModelsKeys.cache, null)
    },
  })
}
