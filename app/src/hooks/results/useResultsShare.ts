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

  // Share image via Web Share API
  const shareImage = useCallback(
    async (imageUrl?: string) => {
      const urlToShare = imageUrl || generatedImages[0]?.url
      if (!urlToShare) return

      // Try Web Share API first
      let shareSuccessful = false

      try {
        // Fetch the image as blob for sharing
        // const response = await fetch(urlToShare)
        // const blob = await response.blob()
        // const file = new File([blob], 'try-on-result.jpg', { type: blob.type })

        // // Check if Web Share API is supported and can share files
        // if (navigator.share && navigator.canShare?.({ files: [file] })) {
        //   await navigator.share({
        //     title: 'Try-On Result',
        //     text: 'Check out my virtual try-on result!',
        //     files: [file],
        //   })
        //   trackEvent('imageShared', { imageUrl: urlToShare, method: 'web-share-api' })
        //   shareSuccessful = true
        // } else
        if (navigator.share) {
          // Fallback to sharing URL if files not supported
          await navigator.share({
            title: 'Try-On Result',
            text: 'Check out my virtual try-on result!',
            url: urlToShare,
          })
          trackEvent('imageShared', { imageUrl: urlToShare, method: 'web-share-api-url' })
          shareSuccessful = true
        }
      } catch (error) {
        // Check if user cancelled the share dialog
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('User cancelled sharing')
          // Don't track as failure - user intentionally cancelled
          return
        } else {
          console.log('Web Share API failed (permission policy or other error):', error)
          // This is a real error, continue to track it
        }
      }

      // If Web Share API failed or not available, do nothing
      if (!shareSuccessful) {
        console.log('Sharing not available - Web Share API failed or not supported')
        trackEvent('imageShareFailed', {
          imageUrl: urlToShare,
          error: 'Web Share API not available',
        })
      }
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
