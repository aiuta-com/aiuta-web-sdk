import { useCallback } from 'react'

// TODO: Replace with RPC - need to support opening fullscreen modal from iframe to SDK
// Required data: { images: InputImage[], modalType?: string, activeImage?: InputImage }

export interface ImageItem {
  id: string
  url: string
}

interface UseFullScreenViewerOptions {
  modalType: 'uploads' | 'generations'
  images: ImageItem[]
}

/**
 * Hook for managing full-screen image viewing
 */
export const useFullScreenViewer = ({ modalType, images }: UseFullScreenViewerOptions) => {
  const showFullScreen = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_activeImage: ImageItem) => {
      // TODO: Replace with RPC call to SDK
      // await rpc.sdk.openFullScreenModal({
      //   images,
      //   modalType,
      //   activeImage
      // })
      // Note: Legacy messaging removed, implement RPC method openFullScreenModal
    },
    [modalType, images],
  )

  return {
    showFullScreen,
  }
}
