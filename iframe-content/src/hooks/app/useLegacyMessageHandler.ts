import { useEffect } from 'react'
import { MESSAGE_ACTIONS } from '@shared/messaging'

/**
 * Hook for handling legacy postMessage events
 * TODO: Remove when all functionality is migrated to RPC
 */
export const useLegacyMessageHandler = () => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Legacy postMessage handler for non-RPC functionality
      if (
        event.data &&
        event.data.action &&
        event.data.action === MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL
      ) {
        // Handle fullscreen modal data from postMessage
        console.log('Received fullscreen modal data:', event.data.data)
        // The FullScreenImageModal component will handle this via its own message listener
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])
}
