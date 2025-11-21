import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { onboardingIsCompletedSelector } from '@/store/slices/onboardingSlice'
import { useUploadsData } from '@/hooks/data'

/**
 * Hook for determining and navigating to the initial route based on app state
 */
export const useInitialRoute = () => {
  const navigate = useNavigate()
  const isMobile = useAppSelector(isMobileSelector)
  const isOnboardingCompleted = useAppSelector(onboardingIsCompletedSelector)
  const { data: uploads = [] } = useUploadsData()

  const navigateInitially = useCallback(() => {
    if (!isOnboardingCompleted) {
      // First-time user - go to onboarding
      navigate('/onboarding')
      return
    }

    // Onboarding completed - decide where to go next
    const hasPhotos = uploads.length > 0

    if (hasPhotos) {
      // User has photos - go to try-on page
      navigate('/tryon')
    } else {
      // No photos - mobile goes to tryon, desktop to QR upload
      navigate(isMobile ? '/tryon' : '/qr')
    }
  }, [navigate, isMobile, isOnboardingCompleted, uploads.length])

  return { navigateInitially }
}
