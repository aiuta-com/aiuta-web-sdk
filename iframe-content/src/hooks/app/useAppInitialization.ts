import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { configSlice } from '@lib/redux/slices/configSlice'
import { isMobileSelector } from '@lib/redux/slices/configSlice/selectors'

/**
 * Hook for managing app initialization logic
 */
export const useAppInitialization = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isMobile = useAppSelector(isMobileSelector)

  const getStoredData = useCallback(() => {
    const isOnboarding = localStorage.getItem('isOnboarding') || false
    const recentlyPhotos = JSON.parse(localStorage.getItem('tryon-recent-photos') || '[]')

    return { isOnboarding, recentlyPhotos, hasPhotos: recentlyPhotos.length > 0 }
  }, [])

  const navigateBasedOnState = useCallback(
    (hasPhotos: boolean) => {
      if (hasPhotos) {
        // User has photos - go to try-on page
        navigate('/view')
      } else {
        // No photos - mobile goes to view, desktop to QR upload
        navigate(isMobile ? '/view' : '/qr')
      }
    },
    [navigate, isMobile],
  )

  const completeInitialization = useCallback(() => {
    dispatch(configSlice.actions.setIsInitialized(true))
    dispatch(configSlice.actions.setIsShowSpinner(false))
  }, [dispatch])

  const handleOnboardingComplete = useCallback(() => {
    const { hasPhotos } = getStoredData()

    navigateBasedOnState(hasPhotos)

    // Complete initialization after navigation
    setTimeout(() => {
      completeInitialization()
    }, 500)
  }, [getStoredData, navigateBasedOnState, completeInitialization])

  const handleFirstTimeUser = useCallback(() => {
    completeInitialization()

    // Hide footer on mobile for first-time users
    if (isMobile) {
      dispatch(configSlice.actions.setIsShowFooter(false))
    }
  }, [completeInitialization, isMobile, dispatch])

  const initializeApp = useCallback(() => {
    if (!globalThis) return

    // Show loading spinner
    dispatch(configSlice.actions.setIsShowSpinner(true))

    // Delay to show onboarding animation
    setTimeout(() => {
      const { isOnboarding } = getStoredData()

      if (isOnboarding) {
        handleOnboardingComplete()
      } else {
        handleFirstTimeUser()
      }
    }, 2000) // 2 second delay for onboarding display
  }, [dispatch, getStoredData, handleOnboardingComplete, handleFirstTimeUser])

  return { initializeApp }
}
