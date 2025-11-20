import { useEffect } from 'react'
import { useLoggerControl, useRpc, useLogger } from '@/contexts'

/**
 * Hook that manages logger state based on RPC debug configuration
 */
export const useLoggerConfig = () => {
  const { setEnabled } = useLoggerControl()
  const rpc = useRpc()
  const logger = useLogger()

  useEffect(() => {
    if (!rpc) return

    try {
      const debugSettings = rpc.config.debugSettings
      if (debugSettings && typeof debugSettings.isLoggingEnabled === 'boolean') {
        setEnabled(debugSettings.isLoggingEnabled)
      }
    } catch (error) {
      logger.warn('Failed to get debug config from RPC:', error)
    }
  }, [rpc, setEnabled, logger])
}
