import { useMemo } from 'react'
import { useAppSelector } from '@/store/store'
import { currentResultIdSelector } from '@/store/slices/generationsSlice/selectors'
import { useGenerationsData } from '@/hooks/data'

/**
 * Results gallery — the results screen shows the latest generation from the
 * single (persisted) generations history, identified by currentResultId; the
 * fullscreen opens that same history at that image. There is no separate
 * "current results" list anymore, so deleting the image anywhere is reflected
 * here immediately.
 */
export const useResultsGallery = () => {
  const currentResultId = useAppSelector(currentResultIdSelector)
  // History is stored newest-first
  const { data: images = [] } = useGenerationsData()

  const currentImage = useMemo(
    () => images.find((image) => image.id === currentResultId),
    [images, currentResultId],
  )

  return {
    currentImage,
    // Full history (newest-first), for the fullscreen gallery
    images,
  }
}
