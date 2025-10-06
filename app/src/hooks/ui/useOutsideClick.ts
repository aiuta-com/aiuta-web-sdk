import { useEffect } from 'react'
import { useAppVisibility } from './useAppVisibility'

/**
 * Hook that handles clicks outside the app container
 * Only works in main app context (not in QR Upload standalone mode)
 */
export const useOutsideClick = () => {
  const { hideApp } = useAppVisibility()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element

      // If target is no longer in the document (was removed during click handling), ignore
      if (!document.contains(target)) {
        return
      }

      // Find the AppContainer element
      const appContainer = document.querySelector('[data-testid="aiuta-app-container"]')

      // Check if click is on modal overlays that should not close the app
      const shareModal = document.querySelector('[data-testid="aiuta-share-modal"]')
      const fullscreenGallery = document.querySelector('[data-testid="aiuta-fullscreen-gallery"]')
      const advancedFullscreenGallery = document.querySelector('[data-testid="fullscreen-gallery"]')
      const bottomSheet = document.querySelector('[data-testid="aiuta-bottom-sheet"]')

      // Check if target is the modal itself or inside any modal
      const isInsideModal =
        target.closest('[data-testid="aiuta-share-modal"]') ||
        target.closest('[data-testid="aiuta-fullscreen-gallery"]') ||
        target.closest('[data-testid="fullscreen-gallery"]') ||
        target.closest('[data-testid="aiuta-bottom-sheet"]') ||
        shareModal?.contains(target) ||
        fullscreenGallery?.contains(target) ||
        advancedFullscreenGallery?.contains(target) ||
        bottomSheet?.contains(target)

      // If click is inside any modal, don't hide the app
      if (isInsideModal) {
        return
      }

      // If click is outside AppContainer, hide the app
      if (appContainer && !appContainer.contains(target)) {
        hideApp()
      }
    }

    // Add click listener to the root element
    const rootElement = document.getElementById('aiuta-root')
    if (rootElement) {
      rootElement.addEventListener('click', handleClick)

      return () => {
        rootElement.removeEventListener('click', handleClick)
      }
    }
  }, [hideApp])
}
