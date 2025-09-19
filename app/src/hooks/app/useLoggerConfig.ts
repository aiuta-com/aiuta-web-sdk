import { useEffect } from 'react'
import { useLoggerControl, useRpc } from '@/contexts'

/**
 * Hook that manages logger state based on RPC debug configuration
 */
export const useLoggerConfig = () => {
  const { setEnabled } = useLoggerControl()
  const rpc = useRpc()

  useEffect(() => {
    if (!rpc) return

    try {
      const debugSettings = rpc.config.debugSettings
      if (debugSettings && typeof debugSettings.isLoggingEnabled === 'boolean') {
        setEnabled(debugSettings.isLoggingEnabled)
      }
    } catch (error) {
      console.warn('Failed to get debug config from RPC:', error)
    }
  }, [rpc, setEnabled])
}
