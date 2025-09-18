import { useEffect } from 'react'
import { useAppDispatch, store } from '@/store/store'
import { appSlice, isMobileSelector } from '@/store/slices/appSlice'

// Mobile breakpoint constant
const MOBILE_BREAKPOINT = 992

/**
 * Hook for handling window resize and mobile state management
 */
export const useWindowResize = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleResize = () => {
      const state = store.getState()
      const currentIsMobile = isMobileSelector(state)
      const width = window.innerWidth

      // Update mobile state based on window width
      if (width <= MOBILE_BREAKPOINT && !currentIsMobile) {
        dispatch(appSlice.actions.setIsMobile(true))
      } else if (width > MOBILE_BREAKPOINT && currentIsMobile) {
        dispatch(appSlice.actions.setIsMobile(false))
      }
    }

    // Set initial mobile state
    handleResize()

    // Listen for window resize
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])
}
