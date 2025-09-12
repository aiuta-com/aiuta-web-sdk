import { useEffect } from 'react'
import { useLoggerControl, useRpcApp } from '@/contexts'

/**
 * Hook that manages logger state based on RPC debug configuration
 */
export const useLoggerConfig = () => {
  const { setEnabled } = useLoggerControl()
  const rpcApp = useRpcApp()

  useEffect(() => {
    if (!rpcApp) return

    try {
      const debugSettings = rpcApp.config.debugSettings
      if (debugSettings && typeof debugSettings.isLoggingEnabled === 'boolean') {
        setEnabled(debugSettings.isLoggingEnabled)
      }
    } catch (error) {
      console.warn('Failed to get debug config from RPC:', error)
    }
  }, [rpcApp, setEnabled])
}
