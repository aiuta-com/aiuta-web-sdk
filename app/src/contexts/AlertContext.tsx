import React, { createContext, useContext, ReactNode } from 'react'
import { useAlert } from '@/hooks'
import { Alert } from '@/components'

interface AlertContextValue {
  showAlert: (message: string, buttonText: string, onClose?: () => void) => void
  closeAlert: () => void
}

interface AlertStateContextValue {
  animationState: 'closed' | 'opening' | 'open' | 'closing'
  showContent: boolean
  message: string
  buttonText: string
  isVisible: boolean
}

const AlertContext = createContext<AlertContextValue | null>(null)
const AlertStateContext = createContext<AlertStateContextValue | null>(null)

export const useAlertContext = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlertContext must be used within AlertProvider')
  }
  return context
}

const useAlertStateContext = () => {
  const context = useContext(AlertStateContext)
  if (!context) {
    throw new Error('useAlertStateContext must be used within AlertProvider')
  }
  return context
}

interface AlertProviderProps {
  children: ReactNode
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const alertState = useAlert()

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
  const { closeAlert } = useAlertContext()
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
