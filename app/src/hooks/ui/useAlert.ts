import { useState, useCallback, useRef, useEffect } from 'react'

type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

/**
 * Hook for managing Alert state with imperative API
 * Call showAlert(message, buttonText, onClose) to display alert
 */
export const useAlert = () => {
  const [animationState, setAnimationState] = useState<AnimationState>('closed')
  const [showContent, setShowContent] = useState(false)
  const [message, setMessage] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | undefined>()
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Show alert with message and button text
  const showAlert = useCallback((msg: string, btnText: string, onClose?: () => void) => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    setMessage(msg)
    setButtonText(btnText)
    setOnCloseCallback(() => onClose)
    setShowContent(true)
    setAnimationState('opening')

    // Transition to open state after small delay
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState('open')
    }, 50)
  }, [])

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
      onCloseCallback?.()
    }, 200) // Match CSS transition duration
  }, [onCloseCallback])

  return {
    animationState,
    showContent,
    message,
    buttonText,
    isVisible: animationState !== 'closed',
    showAlert,
    closeAlert,
  }
}
