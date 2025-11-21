import { useAppSelector } from '@/store/store'
import { currentResultsSelector } from '@/store/slices/generationsSlice/selectors'

/**
 * Hook for managing results gallery
 * Uses only Redux currentResults for instant display
 * (storage is used only for history page /generations)
 */
export const useResultsGallery = () => {
  // Fresh results from Redux (instant, no storage delay)
  const generatedImages = useAppSelector(currentResultsSelector)

  return {
    // Return last generated image (most recent)
    currentImage: generatedImages[generatedImages.length - 1],
  }
}
