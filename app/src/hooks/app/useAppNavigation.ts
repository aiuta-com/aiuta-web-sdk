import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Navigation events that can be dispatched across the app
 */
export const NavigationEvents = {
  NAVIGATE_HOME: 'aiuta:navigate-home',
  FORCE_HOME_NAVIGATION: 'aiuta:force-home-navigation',
  // Add more navigation events here as needed
} as const

/**
 * Hook for centralized navigation event management
 * Provides both event dispatching and listening capabilities
 * Must be used within Router context for listening
 */
export const useAppNavigation = () => {
  const navigate = useNavigate()

  // Event listeners (must be within Router context)
  useEffect(() => {
    const handleNavigateHome = () => {
      navigate('/')
    }

    const handleForceNavigateHome = () => {
      navigate('/')
    }

    window.addEventListener(NavigationEvents.NAVIGATE_HOME, handleNavigateHome)
    window.addEventListener(NavigationEvents.FORCE_HOME_NAVIGATION, handleForceNavigateHome)

    return () => {
      window.removeEventListener(NavigationEvents.NAVIGATE_HOME, handleNavigateHome)
      window.removeEventListener(NavigationEvents.FORCE_HOME_NAVIGATION, handleForceNavigateHome)
    }
  }, [navigate])

  // Event dispatchers (can be used anywhere)
  const navigateToHome = useCallback(() => {
    window.dispatchEvent(new CustomEvent(NavigationEvents.NAVIGATE_HOME))
  }, [])

  return {
    navigate,
    // Event dispatchers
    navigateToHome,
  }
}

/**
 * Standalone utility for dispatching navigation events
 * Can be used outside of Router context (e.g., in RPC handlers)
 */
export const dispatchNavigateToHome = () => {
  window.dispatchEvent(new CustomEvent(NavigationEvents.NAVIGATE_HOME))

  // Fallback: if event doesn't work, try force navigation after a short delay
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent(NavigationEvents.FORCE_HOME_NAVIGATION))
  }, 100)
}
