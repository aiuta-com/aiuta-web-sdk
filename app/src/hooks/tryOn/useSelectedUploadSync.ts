import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { tryOnSlice, selectedImageSelector, isGeneratingSelector } from '@/store/slices/tryOnSlice'
import { useUploadsData } from '@/hooks/data'
import { isInputImage } from '@/models'

/**
 * Keeps the previewed image in sync with the uploads list on the try-on page:
 * - nothing selected and photos exist → preview the most recent
 * - the selected upload is removed → preview the next one, or fall back to the
 *   empty state when none remain
 *
 * Reconciliation only fires when the selected upload was actually removed from
 * the list (present before, gone now). A selection that was never in the local
 * list is left untouched — a freshly picked NewImage, or an image set
 * externally (a QR upload, a predefined model). Otherwise those would be
 * clobbered, e.g. a QR upload replaced by the last used photo, or cleared when
 * there are no local uploads yet.
 */
export const useSelectedUploadSync = () => {
  const dispatch = useAppDispatch()
  const selectedImage = useAppSelector(selectedImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const { data: recentPhotos = [] } = useUploadsData()
  const prevUploadIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const uploadIds = new Set(recentPhotos.map((photo) => photo.id))

    // While generating, the selection is the just-uploaded image not yet in the
    // uploads list — leave it so the loading view stays put
    if (!isGenerating) {
      if (!selectedImage) {
        // Nothing selected: preview the most recent upload, if any
        if (recentPhotos.length > 0) {
          dispatch(tryOnSlice.actions.setSelectedImage(recentPhotos[0]))
        }
      } else if (isInputImage(selectedImage)) {
        const wasRemoved =
          prevUploadIdsRef.current.has(selectedImage.id) && !uploadIds.has(selectedImage.id)
        if (wasRemoved) {
          if (recentPhotos.length > 0) {
            dispatch(tryOnSlice.actions.setSelectedImage(recentPhotos[0]))
          } else {
            dispatch(tryOnSlice.actions.clearSelectedImage())
          }
        }
      }
    }

    prevUploadIdsRef.current = uploadIds
  }, [selectedImage, recentPhotos, isGenerating, dispatch])
}
