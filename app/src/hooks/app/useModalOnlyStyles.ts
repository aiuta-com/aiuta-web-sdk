import { useEffect } from 'react'

/**
 * Hook for applying modal-only styles to DOM elements
 * Adds transparent background and other modal-specific styles
 */
export const useModalOnlyStyles = () => {
  useEffect(() => {
    const rootElement = document.getElementById('root')
    const bodyElement = document.body

    if (rootElement) {
      rootElement.classList.add('modal-only')
    }
    if (bodyElement) {
      bodyElement.classList.add('modal-only')
    }
  }, [])
}
