import { useContext } from 'react'
import { LoggerContext } from './LoggerContext'

export function useLogger() {
  const context = useContext(LoggerContext)
  if (!context) {
    throw new Error('useLogger must be used within a LoggerProvider')
  }
  return context.logger
}

export function useLoggerControl() {
  const context = useContext(LoggerContext)
  if (!context) {
    throw new Error('useLoggerControl must be used within a LoggerProvider')
  }
  return { setEnabled: context.setEnabled, enabled: context.enabled }
}
