import { useEffect } from 'react'
import { useLogger } from '@/contexts'

/**
 * Hook for loading custom CSS from URL parameters
 */
export const useCustomCSS = (cssUrl?: string) => {
  const logger = useLogger()

  useEffect(() => {
    if (!cssUrl) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = cssUrl
    link.onload = () => logger.info('Custom CSS loaded', cssUrl)
    link.onerror = () => logger.error('Failed to load custom CSS', cssUrl)

    document.head.appendChild(link)

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [cssUrl, logger])
}
