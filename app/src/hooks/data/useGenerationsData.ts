import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStorageBackend } from '@/contexts'
import type { GeneratedImage } from '@lib/models'

/**
 * Query key factory for generations
 */
const generationsKeys = {
  all: ['generations'] as const,
}

/**
 * Hook to fetch generated images
 */
export function useGenerationsData() {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: generationsKeys.all,
    queryFn: () => backend.getGeneratedImages(),
  })
}

/**
 * Hook to add a generated image
 */
export function useAddGeneration() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (image: GeneratedImage) => backend.addGeneratedImage(image),
    onSuccess: (updatedImages) => {
      // Update cache with new list
      queryClient.setQueryData(generationsKeys.all, updatedImages)
    },
  })
}

/**
 * Hook to remove a generated image
 */
export function useRemoveGeneration() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => backend.removeGeneratedImage(imageId),
    onSuccess: (updatedImages) => {
      // Update cache with new list
      queryClient.setQueryData(generationsKeys.all, updatedImages)
    },
  })
}

/**
 * Hook to clear all generated images
 */
export function useClearGenerations() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backend.clearGeneratedImages(),
    onSuccess: () => {
      // Clear cache
      queryClient.setQueryData(generationsKeys.all, [])
    },
  })
}
