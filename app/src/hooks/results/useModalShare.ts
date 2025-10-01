import { useState, useCallback } from 'react'

interface ShareModalData {
  imageUrl: string
}

/**
 * Hook for managing Share modal state and actions
 */
export const useModalShare = () => {
  const [modalData, setModalData] = useState<ShareModalData | null>(null)

  // Open share modal with image URL
  const openShareModal = useCallback((imageUrl: string) => {
    setModalData({ imageUrl })
  }, [])

  // Close share modal
  const closeShareModal = useCallback(() => {
    setModalData(null)
  }, [])

  return {
    modalData,
    isOpen: !!modalData,
    openShareModal,
    closeShareModal,
  }
}
