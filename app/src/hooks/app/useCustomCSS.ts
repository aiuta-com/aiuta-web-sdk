import { useEffect } from 'react'

/**
 * Hook for loading custom CSS from URL parameters
 */
export const useCustomCSS = (cssUrl?: string) => {
  useEffect(() => {
    if (!cssUrl) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = cssUrl
    link.onload = () => console.log('Custom CSS loaded from:', cssUrl)
    link.onerror = () => console.error('Failed to load custom CSS from:', cssUrl)

    document.head.appendChild(link)

    // Cleanup function to remove the link when component unmounts or cssUrl changes
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [cssUrl])
}
