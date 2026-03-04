import { useContext } from 'react'
import { AlertContext, AlertStateContext } from './AlertContext'

/**
 * Public API for using alerts throughout the application
 * Use this hook to show/close alerts from anywhere
 */
export function useAlert() {
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
export function useAlertStateContext() {
  const context = useContext(AlertStateContext)
  if (!context) {
    throw new Error('useAlertStateContext must be used within AlertProvider')
  }
  return context
}
