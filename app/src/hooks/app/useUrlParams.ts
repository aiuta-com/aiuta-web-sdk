import { useMemo } from 'react'

/**
 * Hook for parsing and accessing URL parameters
 */
export const useUrlParams = () => {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), [])

  const cssUrl = urlParams.get('css') || undefined
  const initialPath = window.location.hash.replace(/^#/, '') || '/'

  return {
    urlParams,
    cssUrl,
    initialPath,
  }
}
