import { useEffect } from 'react'

/**
 * Custom hook to handle bootstrap to main app transition
 * Should be called only when RPC is ready
 */
export const useBootstrapTransition = () => {
  useEffect(() => {
    // Check if we're running inside bootstrap environment
    if (window.aiutaBootstrap?.ready) {
      // Wait for RPC to be fully established before hiding bootstrap
      const timer = setTimeout(() => {
        window.aiutaBootstrap?.hideBootstrap()
      }, 100) // Small delay to ensure smooth transition

      return () => clearTimeout(timer)
    }
  }, [])
}
