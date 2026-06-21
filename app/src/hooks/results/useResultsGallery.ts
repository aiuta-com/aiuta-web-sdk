import { useMemo } from 'react'
import { useAppSelector } from '@/store/store'
import { currentResultsSelector } from '@/store/slices/generationsSlice/selectors'

/**
 * Hook for managing results gallery
 * Uses only Redux currentResults for instant display
 * (storage is used only for history page /generations)
 */
export const useResultsGallery = () => {
  // Fresh results from Redux (instant, no storage delay), stored oldest → newest
  const generatedImages = useAppSelector(currentResultsSelector)

  // Expose newest → oldest, to match the generations history ordering (newest at
  // the top of the fullscreen thumbnail strip / first in the swipe sequence).
  const images = useMemo(() => [...generatedImages].reverse(), [generatedImages])

  return {
    // Most recent result (now the first item)
    currentImage: images[0],
    images,
  }
}
