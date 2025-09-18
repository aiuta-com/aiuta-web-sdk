import { useMemo } from 'react'
import { type ModalType } from '@/components/ModalRenderer'

/**
 * Hook for parsing and accessing URL parameters
 *
 * Modal URL structure:
 * - ?modal=share → ShareModal in fullscreen iframe
 * - ?modal=fullscreen → FullScreenGallery in fullscreen iframe
 * - No modal param → Main app in small iframe
 */
export const useUrlParams = () => {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), [])

  const modalType = urlParams.get('modal') as ModalType | null
  const cssUrl = urlParams.get('css') || undefined
  const initialPath = window.location.hash.replace(/^#/, '') || '/'

  return {
    urlParams,
    modalType,
    cssUrl,
    initialPath,
  }
}
