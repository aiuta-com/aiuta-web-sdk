import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'
// import { onboardingSlice } from '@/store/slices/onboardingSlice' // TODO: Remove if unused
import { isMobileSelector } from '@/store/slices/appSlice'
import { onboardingIsCompletedSelector } from '@/store/slices/onboardingSlice'
import { UploadsStorage } from '@/utils'

/**
 * Hook for managing app initialization logic
 */
export const useAppInitialization = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isMobile = useAppSelector(isMobileSelector)
  const isOnboardingCompleted = useAppSelector(onboardingIsCompletedSelector)

  const getStoredData = useCallback(() => {
    const recentlyPhotos = UploadsStorage.getInputImages()

    return { recentlyPhotos, hasPhotos: recentlyPhotos.length > 0 }
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
    dispatch(appSlice.actions.setIsInitialized(true))
    dispatch(appSlice.actions.setIsLoading(false))
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
    // Redirect to onboarding for first-time users
    navigate('/onboarding')

    completeInitialization()

    // Hide footer on mobile for first-time users
    if (isMobile) {
      dispatch(appSlice.actions.setHasFooter(false))
    }
  }, [navigate, completeInitialization, isMobile, dispatch])

  const initializeApp = useCallback(() => {
    if (!globalThis) return

    // Show loading spinner
    dispatch(appSlice.actions.setIsLoading(true))

    // Delay to show onboarding animation
    setTimeout(() => {
      if (isOnboardingCompleted) {
        handleOnboardingComplete()
      } else {
        handleFirstTimeUser()
      }
    }, 2000) // 2 second delay for onboarding display
  }, [dispatch, isOnboardingCompleted, handleOnboardingComplete, handleFirstTimeUser])

  return { initializeApp }
}
