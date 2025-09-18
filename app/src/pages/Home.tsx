import React, { useEffect } from 'react'
import { Spinner } from '@/components'
import { useAppInitialization } from '@/hooks'

/**
 * Home - App entry point and initializer
 *
 * Handles:
 * - App initialization (RPC, storage, state)
 * - Loading state during initialization
 * - Automatic navigation based on user state (handled in useAppInitialization)
 *
 * After initialization, users are automatically redirected to:
 * - /onboarding (if onboarding not completed)
 * - /view or /qr (if onboarding completed, based on mobile/desktop and stored photos)
 */
export default function Home() {
  const { initializeApp } = useAppInitialization()

  // Initialize app on mount
  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  // Show loading spinner during initialization
  return <Spinner isVisible={true} />
}
