import React, { ReactNode, useState, useCallback, useRef, useEffect } from 'react'
import type { AnimationState } from './AlertTypes'
import { AlertContext, AlertStateContext } from './AlertContext'

/**
 * Private hook for managing Alert state with imperative API
 * This is internal implementation, use useAlert() for public API
 */
function useAlertState() {
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

  // Internal helper to hide alert with optional callback execution
  const hideAlert = useCallback(
    (executeCallback: boolean) => {
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
        if (executeCallback) {
          onCloseCallback?.()
        }
      }, 200) // Match CSS transition duration
    },
    [onCloseCallback],
  )

  // Close alert with callback execution
  const closeAlert = useCallback(() => hideAlert(true), [hideAlert])

  // Discard alert without calling the callback
  const discardAlert = useCallback(() => hideAlert(false), [hideAlert])

  return {
    animationState,
    showContent,
    message,
    buttonText,
    isVisible: animationState !== 'closed',
    showAlert,
    closeAlert,
    discardAlert,
  }
}

interface AlertProviderProps {
  children: ReactNode
}

export function AlertProvider({ children }: AlertProviderProps) {
  const alertState = useAlertState()

  return (
    <AlertContext.Provider
      value={{
        showAlert: alertState.showAlert,
        closeAlert: alertState.closeAlert,
        discardAlert: alertState.discardAlert,
      }}
    >
      <AlertStateContext.Provider
        value={{
          animationState: alertState.animationState,
          showContent: alertState.showContent,
          message: alertState.message,
          buttonText: alertState.buttonText,
          isVisible: alertState.isVisible,
        }}
      >
        {children}
      </AlertStateContext.Provider>
    </AlertContext.Provider>
  )
}
