import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { useRpc, useLogger, useShare } from '@/contexts'
import { useGenerationsData } from '@/hooks/data'

/**
 * Hook for sharing a result: native Web Share API when the device supports it,
 * otherwise the in-app share modal (copy / WhatsApp / Messenger). The choice is
 * by capability, not viewport width — a narrow desktop window has no native
 * share, so it must fall back instead of silently failing.
 */
export const useNavigatorShare = () => {
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const logger = useLogger()
  const { openShareModal } = useShare()
  const { data: generatedImages = [] } = useGenerationsData()
  const productIds = useAppSelector(productIdsSelector)

  // Share image via Web Share API
  const shareImage = useCallback(
    async (imageUrl?: string) => {
      const urlToShare = imageUrl || generatedImages[0]?.url
      if (!urlToShare) return

      // No native Web Share API (e.g. desktop) → use the in-app share modal
      if (!navigator.share) {
        openShareModal(urlToShare)
        return
      }

      // Prepare the payload (file when supported). Anything failing here is
      // BEFORE the native sheet opens, so it's safe to fall back to the modal.
      let payload: ShareData
      let method: 'web-share-api' | 'web-share-api-url'
      try {
        const response = await fetch(urlToShare)
        const blob = await response.blob()
        const mimeType = blob.type || 'image/jpeg'
        const fileExtension = mimeType.includes('png') ? 'png' : 'jpg'
        const file = new File([blob], `try-on.${fileExtension}`, {
          type: mimeType,
          lastModified: Date.now(),
        })

        if (navigator.canShare?.({ files: [file] })) {
          payload = { title: 'Virtual Try-On Result', text: 'Check out how this looks on me!', files: [file] }
          method = 'web-share-api'
        } else {
          payload = { title: 'Virtual Try-On Result', text: 'Check out how this looks on me!', url: urlToShare }
          method = 'web-share-api-url'
        }
      } catch (error) {
        logger.warn('Could not prepare the share payload, falling back to the modal:', error)
        openShareModal(urlToShare)
        return
      }

      // Invoke the native sheet. From here the user is engaged, so only a
      // "couldn't start" failure falls back — a cancel or a failure after the
      // sheet opened must NOT reopen our modal over the native flow.
      try {
        await navigator.share(payload)
        rpc.sdk.trackEvent({
          type: 'share',
          event: 'succeeded',
          pageId: 'results',
          productIds,
          imageUrl: urlToShare,
          method,
        })
      } catch (error) {
        const name = error instanceof Error ? error.name : ''

        // User dismissed / a failure once the sheet was up — leave it be
        if (name === 'AbortError') {
          logger.info('User cancelled sharing')
          return
        }

        // The sheet couldn't open (blocked by permissions policy, lost user
        // activation, ...) → fall back so the user can still share
        if (name === 'NotAllowedError') {
          logger.warn('Native share could not start, falling back to the modal')
          openShareModal(urlToShare)
          return
        }

        // Any other error after invoking — don't reopen our modal over it
        logger.warn('Native share failed:', error)
      }
    },
    [generatedImages, rpc, productIds, logger, openShareModal],
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
