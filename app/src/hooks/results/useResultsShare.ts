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

  // Helper function for manual copy fallback
  const showManualCopyFallback = useCallback(
    (urlToShare: string) => {
      console.log('Share URL (manual copy):', urlToShare)
      trackEvent('imageShared', { imageUrl: urlToShare, method: 'manual' })

      // TODO: Replace with proper modal/toast component
      const isHttps = window.location.protocol === 'https:'
      const message = isHttps
        ? `Copy this link to share: ${urlToShare}`
        : `Copy this link to share (HTTPS required for auto-copy): ${urlToShare}`

      alert(message)
    },
    [trackEvent],
  )

  // Share image via Web Share API
  const shareImage = useCallback(
    async (imageUrl?: string) => {
      const urlToShare = imageUrl || generatedImages[0]?.url
      if (!urlToShare) return

      // Try Web Share API first
      let shareSuccessful = false

      try {
        // Fetch the image as blob for sharing
        const response = await fetch(urlToShare)
        const blob = await response.blob()
        const file = new File([blob], 'try-on-result.jpg', { type: blob.type })

        // Check if Web Share API is supported and can share files
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: 'Try-On Result',
            text: 'Check out my virtual try-on result!',
            files: [file],
          })
          trackEvent('imageShared', { imageUrl: urlToShare, method: 'web-share-api' })
          shareSuccessful = true
        } else if (navigator.share) {
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
        console.log('Web Share API failed, trying fallback methods:', error)
        // Don't track as failure yet - we have fallbacks
      }

      // If Web Share API failed or not available, try fallback methods
      if (!shareSuccessful) {
        const isHttps = window.location.protocol === 'https:'

        if (isHttps && navigator.clipboard && navigator.clipboard.writeText) {
          try {
            // Fallback: copy to clipboard (only works on HTTPS)
            await navigator.clipboard.writeText(urlToShare)
            trackEvent('imageShared', { imageUrl: urlToShare, method: 'clipboard' })
            // TODO: Show user feedback that link was copied
            console.log('Image URL copied to clipboard')
          } catch (clipboardError) {
            console.error('Clipboard failed:', clipboardError)
            // Show manual copy fallback
            showManualCopyFallback(urlToShare)
          }
        } else {
          // HTTP or clipboard not available - show manual copy
          showManualCopyFallback(urlToShare)
        }
      }
    },
    [generatedImages, trackEvent, showManualCopyFallback],
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
