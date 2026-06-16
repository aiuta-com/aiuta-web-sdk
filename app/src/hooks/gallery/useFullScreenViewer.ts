import { useCallback } from 'react'
import { useAppDispatch } from '@/store/store'
import { galleryModalSlice } from '@/store/slices/galleryModalSlice'

export interface ImageItem {
  id: string
  url: string
}

interface UseFullScreenViewerOptions {
  modalType: 'uploads' | 'generations'
  images: ImageItem[]
}

/**
 * Hook for opening the desktop fullscreen gallery modal. Only the generations
 * history uses it (uploads have no fullscreen flow); the mobile fullscreen is a
 * separate single-image flow on uploadsSlice.
 */
export const useFullScreenViewer = ({ modalType, images }: UseFullScreenViewerOptions) => {
  const dispatch = useAppDispatch()

  const showFullScreen = useCallback(
    (activeImage: ImageItem) => {
      if (modalType !== 'generations') return
      dispatch(
        galleryModalSlice.actions.openGalleryModal({
          images,
          activeId: activeImage.id,
          modalType: 'generations',
        }),
      )
    },
    [dispatch, modalType, images],
  )

  return {
    showFullScreen,
  }
}
