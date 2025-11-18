import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { useRpc } from '@/contexts'
import { useUploadsGallery } from '@/hooks'

/**
 * Hook for TryOnWithOtherPhoto feature
 * Provides access to feature state, icon, and click handler
 *
 * Behavior:
 * - If multiple photos in history: navigate to uploads page (desktop) or open bottom sheet (mobile)
 * - If 1 or fewer photos: navigate to QR page (desktop) or open bottom sheet (mobile)
 */
export const useTryOnWithOtherPhoto = () => {
  const rpc = useRpc()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isMobile = useAppSelector(isMobileSelector)
  const { recentlyPhotos } = useUploadsGallery()

  const otherPhotoConfig = rpc.config.features?.tryOn?.otherPhoto

  const hasMultiplePhotos = recentlyPhotos.length > 1

  const handleClick = useCallback(() => {
    if (hasMultiplePhotos) {
      // Multiple photos in history
      if (isMobile) {
        // Mobile: open bottom sheet with photo selection
        dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
      } else {
        // Desktop: navigate to uploads page
        navigate('/uploads')
      }
    } else {
      // 1 or fewer photos
      if (isMobile) {
        // Mobile: open bottom sheet without image selection (shows only buttons)
        dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
      } else {
        // Desktop: navigate to QR page
        navigate('/qr')
      }
    }
  }, [hasMultiplePhotos, isMobile, navigate, dispatch])

  return {
    isEnabled: otherPhotoConfig !== null,
    icon: otherPhotoConfig?.icons?.changePhoto24,
    handleClick,
  }
}
