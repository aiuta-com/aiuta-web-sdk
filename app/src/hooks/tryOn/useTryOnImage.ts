import { useCallback } from 'react'
import { useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { resizeAndConvertImage } from '@/utils'
import type { NewImage } from '@/models'

export const useTryOnImage = () => {
  const dispatch = useAppDispatch()

  const selectImageToTryOn = useCallback(
    async (file: File): Promise<NewImage> => {
      // Preparing can take a while (resize, and especially HEIC decode which
      // lazy-loads a wasm decoder) — flag it so the UI can show a loader.
      dispatch(tryOnSlice.actions.setIsProcessingImage(true))
      try {
        const processedFile = await resizeAndConvertImage(file)

        const newImage: NewImage = {
          file: processedFile,
          localUrl: URL.createObjectURL(processedFile),
        }

        dispatch(tryOnSlice.actions.setSelectedImage(newImage))

        return newImage
      } finally {
        dispatch(tryOnSlice.actions.setIsProcessingImage(false))
      }
    },
    [dispatch],
  )

  return {
    selectImageToTryOn,
  }
}
