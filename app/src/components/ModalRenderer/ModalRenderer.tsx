import React from 'react'
import { FullScreenGallery, ShareModal } from '@/components'
import { useModalOnlyStyles } from '@/hooks'

/**
 * Supported modal types for fullscreen iframe rendering
 */
export type ModalType = 'share' | 'fullscreen'

/**
 * Component for rendering appropriate modal in fullscreen iframe mode
 *
 * Used when the app is loaded with ?modal=share or ?modal=fullscreen URL parameter
 * The modal is rendered in a fullscreen iframe created by the SDK
 */
export const ModalRenderer: React.FC<{ modalType: ModalType }> = ({ modalType }) => {
  useModalOnlyStyles()

  switch (modalType) {
    case 'share':
      return <ShareModal />
    case 'fullscreen':
    default:
      return <FullScreenGallery />
  }
}
