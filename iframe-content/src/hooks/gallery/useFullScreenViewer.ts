import { useCallback } from 'react'
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

export interface ImageItem {
  id: string
  url: string
}

interface UseFullScreenViewerOptions {
  modalType: 'history' | 'previously'
  images: ImageItem[]
}

/**
 * Hook for managing full-screen image viewing
 */
export const useFullScreenViewer = ({ modalType, images }: UseFullScreenViewerOptions) => {
  const showFullScreen = useCallback(
    (activeImage: ImageItem) => {
      SecureMessenger.sendToParent({
        action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
        images,
        modalType,
        activeImage,
      })
    },
    [modalType, images],
  )

  return {
    showFullScreen,
  }
}
