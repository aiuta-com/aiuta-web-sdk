import { useEffect, useState } from 'react'
import { useLogger } from '@/contexts'

/**
 * Hook for loading custom CSS from URL parameters
 * Returns loading state to prevent Flash of Unstyled Content
 */
export const useCustomCssUrl = (cssUrl?: string) => {
  const logger = useLogger()
  const [isLoading, setIsLoading] = useState(!!cssUrl)

  useEffect(() => {
    if (!cssUrl) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = cssUrl

    link.onload = () => {
      logger.info('Custom CSS loaded', cssUrl)
      setIsLoading(false)
    }

    link.onerror = () => {
      logger.error('Failed to load custom CSS', cssUrl)
      setIsLoading(false) // Continue anyway with default styles
    }

    document.head.appendChild(link)

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [cssUrl, logger])

  return {
    isLoading,
    isReady: !isLoading,
  }
}
