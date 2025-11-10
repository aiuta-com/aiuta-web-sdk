import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { Alert } from '@/components'

type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

interface AlertContextValue {
  showAlert: (message: string, buttonText: string, onClose?: () => void) => void
  closeAlert: () => void
}

interface AlertStateContextValue {
  animationState: AnimationState
  showContent: boolean
  message: string
  buttonText: string
  isVisible: boolean
}

const AlertContext = createContext<AlertContextValue | null>(null)
const AlertStateContext = createContext<AlertStateContextValue | null>(null)

/**
 * Public API for using alerts throughout the application
 * Use this hook to show/close alerts from anywhere
 */
export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}

/**
 * Private hook for internal alert state management
 * Used only by AlertRenderer
 */
const useAlertStateContext = () => {
  const context = useContext(AlertStateContext)
  if (!context) {
    throw new Error('useAlertStateContext must be used within AlertProvider')
  }
  return context
}

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

interface AlertProviderProps {
  children: ReactNode
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const alertState = useAlertState()

  return (
    <AlertContext.Provider
      value={{
        showAlert: alertState.showAlert,
        closeAlert: alertState.closeAlert,
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

/**
 * Component that renders the Alert UI
 * Should be placed inside AppContainer to ensure proper positioning
 */
export const AlertRenderer = () => {
  const { closeAlert } = useAlert()
  const alertState = useAlertStateContext()

  return (
    <Alert
      animationState={alertState.animationState}
      showContent={alertState.showContent}
      message={alertState.message}
      buttonText={alertState.buttonText}
      isVisible={alertState.isVisible}
      onClose={closeAlert}
    />
  )
}
