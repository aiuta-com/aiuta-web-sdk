import { useCallback } from 'react'
// TODO: Replace with RPC - need to support opening fullscreen modal from iframe to SDK
// Required data: { images: InputImage[], modalType?: string, activeImage?: InputImage }

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
      // TODO: Replace with RPC call to SDK
      // await rpc.sdk.openFullScreenModal({
      //   images,
      //   modalType,
      //   activeImage
      // })

      console.warn(
        'FullScreen modal opening: Legacy messaging removed, implement RPC method openFullScreenModal',
        {
          activeImage,
          modalType,
          imagesCount: images.length,
        },
      )
    },
    [modalType, images],
  )

  return {
    showFullScreen,
  }
}
