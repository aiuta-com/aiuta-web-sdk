import { useEffect } from 'react'
import type { AiutaAppRpc } from '@lib/rpc'

/**
 * Custom hook to handle bootstrap to main app transition
 * Waits for RPC to be ready before hiding bootstrap overlay
 */
export const useBootstrapTransition = (rpc: AiutaAppRpc | null) => {
  useEffect(() => {
    // Check if we're running inside bootstrap environment
    if (window.aiutaBootstrap?.ready && rpc) {
      // Wait for RPC to be fully established before hiding bootstrap
      const timer = setTimeout(() => {
        window.aiutaBootstrap?.hideBootstrap()
      }, 100) // Small delay to ensure smooth transition

      return () => clearTimeout(timer)
    }
  }, [rpc])
}
