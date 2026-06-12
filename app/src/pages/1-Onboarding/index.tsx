import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { useUploadsData } from '@/hooks/data'
import { useOnboardingFlow } from '@/hooks'
import { OnboardingSlides } from './OnboardingSlides'

/**
 * OnboardingPage - app introduction and consent collection
 *
 * The slide list is mode-aware (general/shoes) and snapshotted on mount:
 * per-mode completion is written mid-flow (on Next), and the in-progress
 * sequence must not collapse when that happens.
 */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const isMobile = useAppSelector(isMobileSelector)
  const { data: recentlyPhotos = [] } = useUploadsData()
  const { slides, markSlideCompleted } = useOnboardingFlow()

  const [slideIds] = useState(() => slides)

  const handleComplete = useCallback(() => {
    // Check if user has stored photos
    const hasPhotos = recentlyPhotos.length > 0

    if (hasPhotos) {
      // User has photos - go directly to try-on page
      navigate('/tryon')
    } else {
      // No photos - mobile goes to tryon, desktop to QR upload
      navigate(isMobile ? '/tryon' : '/qr')
    }
  }, [navigate, isMobile, recentlyPhotos.length])

  // Nothing to show (e.g. direct navigation) — skip straight to the picker
  useEffect(() => {
    if (!slideIds.length) {
      handleComplete()
    }
  }, [slideIds.length, handleComplete])

  if (!slideIds.length) return null

  return (
    <OnboardingSlides
      slides={slideIds}
      markSlideCompleted={markSlideCompleted}
      onComplete={handleComplete}
    />
  )
}
