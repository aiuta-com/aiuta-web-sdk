import { useEffect } from 'react'
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

declare const __IFRAME_VERSION__: string

/**
 * Hook for iframe initialization - sending version and requesting styles
 */
export const useIframeInitialization = () => {
  useEffect(() => {
    // Send iframe version to parent
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.IFRAME_LOADED,
      version: __IFRAME_VERSION__,
    })

    // Request styles configuration from parent
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION,
    })
  }, [])
}
