import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStorageBackend } from '@/contexts'
import type { InputImage } from '@lib/models'

/**
 * Query key factory for uploads
 */
const uploadsKeys = {
  all: ['uploads'] as const,
}

/**
 * Hook to fetch uploaded images
 */
export function useUploadsData() {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: uploadsKeys.all,
    queryFn: () => backend.getInputImages(),
  })
}

/**
 * Hook to add an uploaded image
 */
export function useAddUpload() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (image: InputImage) => backend.addInputImage(image),
    onSuccess: (updatedImages) => {
      // Update cache with new list
      queryClient.setQueryData(uploadsKeys.all, updatedImages)
    },
  })
}

/**
 * Hook to remove an uploaded image
 */
export function useRemoveUpload() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => backend.removeInputImage(imageId),
    onSuccess: (updatedImages) => {
      // Update cache with new list
      queryClient.setQueryData(uploadsKeys.all, updatedImages)
    },
  })
}

/**
 * Hook to clear all uploaded images
 */
export function useClearUploads() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backend.clearInputImages(),
    onSuccess: () => {
      // Clear cache
      queryClient.setQueryData(uploadsKeys.all, [])
    },
  })
}
