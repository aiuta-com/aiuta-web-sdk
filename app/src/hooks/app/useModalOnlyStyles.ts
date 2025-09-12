import { useEffect } from 'react'

/**
 * Hook for applying modal-only styles to DOM elements
 */
export const useModalOnlyStyles = (isModalOnly: boolean) => {
  useEffect(() => {
    if (!isModalOnly) return

    const rootElement = document.getElementById('root')
    const bodyElement = document.body

    // Add modal-only classes for transparent background
    if (rootElement) {
      rootElement.classList.add('modal-only')
    }
    if (bodyElement) {
      bodyElement.classList.add('modal-only')
    }

    // Cleanup function
    return () => {
      if (rootElement) {
        rootElement.classList.remove('modal-only')
      }
      if (bodyElement) {
        bodyElement.classList.remove('modal-only')
      }
    }
  }, [isModalOnly])
}
