import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { generatedImagesSelector } from '@/store/slices/generationsSlice/selectors'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'

/**
 * Hook for handling native Web Share API functionality
 */
export const useNavigatorShare = () => {
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const generatedImages = useAppSelector(generatedImagesSelector)
  const productIds = useAppSelector(productIdsSelector)

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

        // Ensure proper MIME type for better thumbnail support
        const mimeType = blob.type || 'image/jpeg'
        const fileExtension = mimeType.includes('png') ? 'png' : 'jpg'
        const file = new File([blob], `try-on.${fileExtension}`, {
          type: mimeType,
          lastModified: Date.now(),
        })

        // Check if Web Share API is supported and can share files
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: 'Virtual Try-On Result',
            text: 'Check out how this looks on me!',
            files: [file],
          })
          rpc.sdk.trackEvent({
            type: 'share',
            event: 'succeeded',
            pageId: 'results',
            productIds,
            imageUrl: urlToShare,
            method: 'web-share-api',
          })
          shareSuccessful = true
        } else if (navigator.share) {
          // Fallback to sharing URL if files not supported
          await navigator.share({
            title: 'Virtual Try-On Result',
            text: 'Check out how this looks on me!',
            url: urlToShare,
          })
          rpc.sdk.trackEvent({
            type: 'share',
            event: 'succeeded',
            pageId: 'results',
            productIds,
            imageUrl: urlToShare,
            method: 'web-share-api-url',
          })
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

      // If Web Share API failed or not available, track failure
      if (!shareSuccessful) {
        console.log('Sharing not available - Web Share API failed or not supported')
        rpc.sdk.trackEvent({
          type: 'share',
          event: 'failed',
          pageId: 'results',
          productIds,
          imageUrl: urlToShare,
          error: 'Web Share API not available',
        })
      }
    },
    [generatedImages, rpc, productIds],
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
