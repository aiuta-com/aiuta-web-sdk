import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { UploadsStorage } from '@/utils'
import { OnboardingDesktop } from './OnboardingDesktop'
import { OnboardingMobile } from './OnboardingMobile'

/**
 * OnboardingPage - app introduction and consent collection
 *
 * Features:
 * - Multi-step introduction flow
 * - User consent collection
 * - Responsive design (desktop/mobile)
 * - Smart navigation based on user state
 */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const isMobile = useAppSelector(isMobileSelector)

  const handleCompleteOnboarding = useCallback(() => {
    // Check if user has stored photos
    const recentlyPhotos = UploadsStorage.getInputImages()
    const hasPhotos = recentlyPhotos.length > 0

    if (hasPhotos) {
      // User has photos - go directly to try-on page
      navigate('/tryon')
    } else {
      // No photos - mobile goes to tryon, desktop to QR upload
      navigate(isMobile ? '/tryon' : '/qr')
    }
  }, [navigate, isMobile])

  return isMobile ? (
    <OnboardingMobile onComplete={handleCompleteOnboarding} />
  ) : (
    <OnboardingDesktop onComplete={handleCompleteOnboarding} />
  )
}
