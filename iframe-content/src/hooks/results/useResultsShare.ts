import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { fileSlice } from '@lib/redux/slices/fileSlice'
import { generatedImagesSelector } from '@lib/redux/slices/generateSlice/selectors'
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'
import { useGalleryAnalytics } from '../gallery/useGalleryAnalytics'

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

      SecureMessenger.sendToParent({
        action: MESSAGE_ACTIONS.SHARE_IMAGE,
        payload: {
          url: urlToShare,
          title: '',
          text: '',
        },
      })

      trackEvent('imageShared', { imageUrl: urlToShare })
    },
    [generatedImages, trackEvent],
  )

  // Handle full screen image on mobile
  const handleMobileImageClick = useCallback(
    (imageUrl: string) => {
      dispatch(fileSlice.actions.setFullScreenImageUrl(imageUrl))
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
