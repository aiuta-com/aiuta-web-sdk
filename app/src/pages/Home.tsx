import React, { useEffect } from 'react'
import { Spinner } from '@/components'
import { useInitialRoute, useStorageInitialization } from '@/hooks'

/**
 * HomePageRouter - App entry point and router
 *
 * Handles:
 * - Loading storage data from IndexedDB/localStorage
 * - Syncing storage data with Redux state
 * - Initial route determination based on app state
 * - Automatic navigation based on user state (handled in useInitialRoute)
 *
 * After initialization, users are automatically redirected to:
 * - /onboarding (if onboarding not completed)
 * - /view or /qr (if onboarding completed, based on mobile/desktop and stored photos)
 */
export default function HomePageRouter() {
  const { navigateInitially } = useInitialRoute()
  const { isInitializing } = useStorageInitialization()

  // Wait for storage data to load before navigating
  useEffect(() => {
    if (!isInitializing) {
      navigateInitially()
    }
  }, [isInitializing, navigateInitially])

  // Show spinner while loading storage data
  return <Spinner isVisible={isInitializing} />
}
