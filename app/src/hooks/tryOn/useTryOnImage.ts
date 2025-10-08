import { useCallback } from 'react'
import { useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { resizeAndConvertImage } from '@/utils'
import type { NewImage } from '@/models'

export const useTryOnImage = () => {
  const dispatch = useAppDispatch()

  const selectImageToTryOn = useCallback(
    async (file: File): Promise<NewImage> => {
      const processedFile = await resizeAndConvertImage(file)

      const newImage: NewImage = {
        file: processedFile,
        localUrl: URL.createObjectURL(processedFile),
      }

      dispatch(tryOnSlice.actions.setSelectedImage(newImage))

      return newImage
    },
    [dispatch],
  )

  return {
    selectImageToTryOn,
  }
}
