import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { generatedImagesSelector } from '@/store/slices/generationsSlice/selectors'

// TODO: Replace with RPC - need to support sharing images to SDK
// Required data: { url: string, productId: string }
import { useGalleryAnalytics } from '@/hooks/gallery/useGalleryAnalytics'

/**
 * Hook for handling results sharing functionality
 */
export const useResultsShare = () => {
  const dispatch = useAppDispatch()
  const generatedImages = useAppSelector(generatedImagesSelector)
  const { trackEvent } = useGalleryAnalytics('generations')

  // Share image via parent window
  const shareImage = useCallback(
    (imageUrl?: string) => {
      const urlToShare = imageUrl || generatedImages[0]?.url
      if (!urlToShare) return

      // TODO: Replace with RPC call to SDK
      // await rpc.sdk.shareImage({
      //   url: urlToShare,
      //   title: '',
      //   text: ''
      // })

      console.warn('Image sharing: Legacy messaging removed, implement RPC method shareImage')

      trackEvent('imageShared', { imageUrl: urlToShare })
    },
    [generatedImages, trackEvent],
  )

  // Handle full screen image on mobile
  const handleMobileImageClick = useCallback(
    (imageUrl: string) => {
      dispatch(uploadsSlice.actions.showImageFullScreen(imageUrl))
    },
    [dispatch],
  )

  return {
    shareImage,
    handleMobileImageClick,
    hasImages: generatedImages.length > 0,
    firstImage: generatedImages[0],
  }
}
