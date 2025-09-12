import React from 'react'
import { FullScreenImageModal, ShareModal } from '@/components'

interface ModalRendererProps {
  modalType: string
}

/**
 * Component for rendering appropriate modal based on type
 */
export const ModalRenderer: React.FC<ModalRendererProps> = ({ modalType }) => {
  switch (modalType) {
    case 'share':
      return <ShareModal />
    case 'fullscreen':
    default:
      return <FullScreenImageModal />
  }
}

export default ModalRenderer
