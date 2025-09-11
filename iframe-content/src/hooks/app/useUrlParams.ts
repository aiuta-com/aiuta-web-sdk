import { useMemo } from 'react'

/**
 * Hook for parsing and accessing URL parameters
 */
export const useUrlParams = () => {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), [])

  const isModalOnly = urlParams.get('modal') === 'true'
  const modalType = urlParams.get('modalType') || 'fullscreen'
  const cssUrl = urlParams.get('css') || undefined
  const initialPath = window.location.hash.replace(/^#/, '') || '/'

  return {
    urlParams,
    isModalOnly,
    modalType,
    cssUrl,
    initialPath,
  }
}
