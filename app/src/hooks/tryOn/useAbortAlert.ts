import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { isAbortedSelector, abortReasonSelector, tryOnSlice } from '@/store/slices/tryOnSlice'

type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

/**
 * Hook for managing AbortAlert state and actions with background animation
 */
export const useAbortAlert = () => {
  const dispatch = useAppDispatch()
  const isAborted = useAppSelector(isAbortedSelector)
  const abortReason = useAppSelector(abortReasonSelector)
  const [animationState, setAnimationState] = useState<AnimationState>('closed')
  const [showContent, setShowContent] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle open/close when isAborted changes
  useEffect(() => {
    if (isAborted) {
      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }

      setShowContent(true)
      setAnimationState('opening')

      // Transition to open state after small delay
      animationTimeoutRef.current = setTimeout(() => {
        setAnimationState('open')
      }, 50)
    } else {
      // If isAborted was reset externally, reset local state immediately
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      setShowContent(false)
      setAnimationState('closed')
    }
  }, [isAborted])

  // Close alert with animation
  const closeAlert = useCallback(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Hide modal content immediately but keep background
    setShowContent(false)
    setAnimationState('closing')

    // Complete close after animation
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState('closed')
      dispatch(tryOnSlice.actions.setIsAborted(false))
    }, 200) // Match CSS transition duration
  }, [dispatch])

  return {
    abortReason,
    animationState,
    showContent,
    isVisible: animationState !== 'closed', // Show background during any animation
    closeAlert,
  }
}
