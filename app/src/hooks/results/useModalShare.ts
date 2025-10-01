import { useState, useCallback, useRef } from 'react'

interface ShareModalData {
  imageUrl: string
}

type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

/**
 * Hook for managing Share modal state and actions with background animation
 */
export const useModalShare = () => {
  const [modalData, setModalData] = useState<ShareModalData | null>(null)
  const [animationState, setAnimationState] = useState<AnimationState>('closed')
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Open share modal with image URL
  const openShareModal = useCallback((imageUrl: string) => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    setModalData({ imageUrl })
    setAnimationState('opening')

    // Transition to open state after small delay
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState('open')
    }, 50) // Small delay to trigger CSS transition
  }, [])

  // Close share modal with animation
  const closeShareModal = useCallback(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Hide modal content immediately but keep background
    setModalData(null)
    setAnimationState('closing')

    // Complete close after animation
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState('closed')
    }, 200) // Match CSS transition duration
  }, [])

  return {
    modalData,
    animationState,
    isOpen: !!modalData,
    isVisible: animationState !== 'closed', // Show background during any animation
    openShareModal,
    closeShareModal,
  }
}
