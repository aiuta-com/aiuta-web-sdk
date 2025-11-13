import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isGeneratingSelector } from '@/store/slices/tryOnSlice'
import { useTryOnImage } from '@/hooks'
import { useAlert } from '@/contexts'

/**
 * Global file drop handler
 * Handles dropped files by selecting them for try-on and navigating to /tryon
 * Ignores drops during generation
 * Discards any open alerts without triggering callbacks
 */
export const useGlobalFileDrop = () => {
  const navigate = useNavigate()
  const isGenerating = useAppSelector(isGeneratingSelector)
  const { selectImageToTryOn } = useTryOnImage()
  const { discardAlert } = useAlert()

  const handleFileDrop = useCallback(
    async ({ file }: { file: File }) => {
      // Ignore if generation is in progress
      if (isGenerating) {
        return
      }

      // Discard any open alerts without triggering callbacks (e.g., navigate('/'))
      discardAlert()

      // Select image and navigate to try-on page
      await selectImageToTryOn(file)
      navigate('/tryon')
    },
    [isGenerating, discardAlert, selectImageToTryOn, navigate],
  )

  return handleFileDrop
}
