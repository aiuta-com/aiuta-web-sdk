import { useCallback, useRef, useState } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { useHasPendingConsents } from './useHasPendingConsents'
import { useOnboardingAnalytics } from './useOnboardingAnalytics'

/**
 * Mobile consent gate for the photo upload. On mobile, with required consents
 * still missing, an upload trigger opens the consent popup instead of the file
 * picker; accepting resumes the original action (so the native picker opens
 * straight after, still within the user gesture). On desktop, or once consents
 * are given, the action runs immediately.
 */
export const useConsentGate = () => {
  const isMobile = useAppSelector(isMobileSelector)
  const hasPendingConsents = useHasPendingConsents()
  const { trackConsentsGiven } = useOnboardingAnalytics()
  const [isConsentOpen, setIsConsentOpen] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)

  const runWithConsent = useCallback(
    (action: () => void) => {
      if (isMobile && hasPendingConsents) {
        pendingActionRef.current = action
        setIsConsentOpen(true)
      } else {
        action()
      }
    },
    [isMobile, hasPendingConsents],
  )

  const closeConsent = useCallback(() => {
    setIsConsentOpen(false)
    pendingActionRef.current = null
  }, [])

  const confirmConsent = useCallback(() => {
    trackConsentsGiven()
    setIsConsentOpen(false)
    const action = pendingActionRef.current
    pendingActionRef.current = null
    // Run synchronously so the file picker opens within this click gesture
    action?.()
  }, [trackConsentsGiven])

  return { isConsentOpen, runWithConsent, closeConsent, confirmConsent }
}
