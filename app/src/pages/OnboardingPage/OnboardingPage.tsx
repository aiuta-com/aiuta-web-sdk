import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { UploadsStorage } from '@/utils'
import { OnboardingDesktop } from './OnboardingDesktop'
import { OnboardingMobile } from './OnboardingMobile'
import { OnboardingPageProps } from './types'
import styles from './OnboardingPage.module.scss'

export const OnboardingPage = ({}: OnboardingPageProps) => {
  const navigate = useNavigate()
  const isMobile = useAppSelector(isMobileSelector)

  const handleCompleteOnboarding = useCallback(() => {
    // Check if user has stored photos
    const recentlyPhotos = UploadsStorage.getInputImages()
    const hasPhotos = recentlyPhotos.length > 0

    if (hasPhotos) {
      // User has photos - go directly to try-on page
      navigate('/view')
    } else {
      // No photos - mobile goes to view, desktop to QR upload
      navigate(isMobile ? '/view' : '/qr')
    }
  }, [navigate, isMobile])

  return (
    <div className={styles.onboardingPage}>
      {isMobile ? (
        <OnboardingMobile onComplete={handleCompleteOnboarding} />
      ) : (
        <OnboardingDesktop onComplete={handleCompleteOnboarding} />
      )}
    </div>
  )
}
