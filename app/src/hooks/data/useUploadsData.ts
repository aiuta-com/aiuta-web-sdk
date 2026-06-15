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
 * Hook to delete uploaded images (one write for the whole batch → the list
 * re-renders once instead of flickering per item). Mirrors the
 * `deleteUploadedImages` data-provider callback; there is no single-delete.
 */
export function useDeleteUploadedImages() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (images: InputImage[]) => backend.deleteUploadedImages(images),
    // Remove from the cache immediately so the picker's auto-select doesn't
    // re-pick a just-deleted photo from a stale list (the storage write lags a
    // tick behind the cache).
    onMutate: (images) => {
      const ids = new Set(images.map((image) => image.id))
      const previous = queryClient.getQueryData<InputImage[]>(uploadsKeys.all)
      queryClient.setQueryData<InputImage[]>(uploadsKeys.all, (current = []) =>
        current.filter((image) => !ids.has(image.id)),
      )
      return { previous }
    },
    onError: (_error, _images, context) => {
      if (context?.previous) {
        queryClient.setQueryData(uploadsKeys.all, context.previous)
      }
    },
    onSuccess: (updatedImages) => {
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
