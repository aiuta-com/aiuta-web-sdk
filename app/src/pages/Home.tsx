import { useEffect } from 'react'
import { useInitialRoute } from '@/hooks'

/**
 * Home - App entry point and router
 *
 * Handles:
 * - Initial route determination based on app state
 * - Automatic navigation based on user state (handled in useInitialRoute)
 *
 * After initialization, users are automatically redirected to:
 * - /onboarding (if onboarding not completed)
 * - /view or /qr (if onboarding completed, based on mobile/desktop and stored photos)
 */
export default function Home() {
  const { navigateInitially } = useInitialRoute()

  // Determine and navigate to initial route on mount
  useEffect(() => {
    navigateInitially()
  }, [navigateInitially])

  // Nothing to render - navigation happens immediately
  return null
}
