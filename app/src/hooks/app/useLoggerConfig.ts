import { useEffect } from 'react'
import type { AiutaAppRpc } from '@lib/rpc'
import { useLoggerControl, useLogger } from '@/contexts'

/**
 * Hook that manages logger state based on RPC debug configuration
 */
export const useLoggerConfig = (rpc?: AiutaAppRpc) => {
  const { setEnabled } = useLoggerControl()
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
