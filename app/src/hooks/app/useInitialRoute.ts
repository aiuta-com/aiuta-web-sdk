import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { useOnboardingFlow } from '@/hooks/onboarding/useOnboardingFlow'
import { useUploadsData } from '@/hooks/data'

/**
 * Hook for determining and navigating to the initial route based on app state
 */
export const useInitialRoute = () => {
  const navigate = useNavigate()
  const isMobile = useAppSelector(isMobileSelector)
  const { slides } = useOnboardingFlow()
  const { data: uploads = [] } = useUploadsData()

  const hasOnboardingSlides = slides.length > 0

  const navigateInitially = useCallback(() => {
    if (hasOnboardingSlides) {
      // Something to show for this mode (intro/best-results/consent)
      navigate('/onboarding')
      return
    }

    // Onboarding not needed - decide where to go next
    const hasPhotos = uploads.length > 0

    if (hasPhotos) {
      // User has photos - go to try-on page
      navigate('/tryon')
    } else {
      // No photos - mobile goes to tryon, desktop to QR upload
      navigate(isMobile ? '/tryon' : '/qr')
    }
  }, [navigate, isMobile, hasOnboardingSlides, uploads.length])

  return { navigateInitially }
}
