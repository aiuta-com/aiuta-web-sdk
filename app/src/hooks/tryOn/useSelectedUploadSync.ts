import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { tryOnSlice, selectedImageSelector, isGeneratingSelector } from '@/store/slices/tryOnSlice'
import { useUploadsData } from '@/hooks/data'
import { isInputImage } from '@/models'

/**
 * Keeps the previewed image in sync with the uploads list on the try-on page:
 * - nothing selected and photos exist → preview the most recent
 * - the selected upload was deleted → preview the next one, or fall back to the
 *   empty state when none remain
 *
 * A freshly picked (not-yet-uploaded) NewImage is left untouched. This replaces
 * the bare "auto-select most recent" effect, which could re-select a just
 * deleted photo (the uploads cache lags one tick behind the cleared selection)
 * and then never drop it — leaving a deleted image stuck in the picker.
 */
export const useSelectedUploadSync = () => {
  const dispatch = useAppDispatch()
  const selectedImage = useAppSelector(selectedImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const { data: recentPhotos = [] } = useUploadsData()

  useEffect(() => {
    // While generating, the selection is the just-uploaded image that is not in
    // the uploads list yet (it's added when generation finishes) — leave it so
    // the loading view stays put
    if (isGenerating) return

    // A picked-but-not-uploaded image isn't part of the uploads list — keep it
    if (selectedImage && !isInputImage(selectedImage)) return

    const selectedStillExists =
      !!selectedImage &&
      isInputImage(selectedImage) &&
      recentPhotos.some((photo) => photo.id === selectedImage.id)

    if (selectedStillExists) return

    if (recentPhotos.length > 0) {
      dispatch(tryOnSlice.actions.setSelectedImage(recentPhotos[0]))
    } else if (selectedImage) {
      dispatch(tryOnSlice.actions.clearSelectedImage())
    }
  }, [selectedImage, recentPhotos, isGenerating, dispatch])
}
