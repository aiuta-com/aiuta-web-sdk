import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'
import type { FeedbackType } from '@/components/results/Feedback'

type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

// In-memory storage for URLs that received feedback
const feedbackGivenUrls = new Set<string>()

/**
 * Hook for managing Feedback state and actions with gratitude message animation
 */
export const useFeedback = (generatedImageUrl: string) => {
  const rpc = useRpc()
  const productIds = useAppSelector(productIdsSelector)
  const [isDisabled, setIsDisabled] = useState(false)
  const [animationState, setAnimationState] = useState<AnimationState>('closed')
  const [showContent, setShowContent] = useState(false)
  const [componentAnimationState, setComponentAnimationState] = useState<AnimationState>(
    feedbackGivenUrls.has(generatedImageUrl) ? 'closed' : 'open',
  )
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const componentTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update component state when image URL changes
  useEffect(() => {
    const hasFeedback = feedbackGivenUrls.has(generatedImageUrl)
    setComponentAnimationState(hasFeedback ? 'closed' : 'open')
    setIsDisabled(false)
    setAnimationState('closed')
    setShowContent(false)
  }, [generatedImageUrl])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      if (componentTimeoutRef.current) {
        clearTimeout(componentTimeoutRef.current)
      }
    }
  }, [])

  const trackFeedback = useCallback(
    (feedbackType: FeedbackType) => {
      if (!productIds.length) return

      const analytic = {
        type: 'feedback',
        event: feedbackType,
        pageId: 'results',
        productIds,
      }

      rpc.sdk.trackEvent(analytic)
    },
    [rpc, productIds],
  )

  const hideComponent = useCallback(() => {
    // Clear any existing timeout
    if (componentTimeoutRef.current) {
      clearTimeout(componentTimeoutRef.current)
    }

    // Start closing animation for entire component
    setComponentAnimationState('closing')

    // Wait for animation to complete, then fully hide
    componentTimeoutRef.current = setTimeout(() => {
      setComponentAnimationState('closed')
    }, 200) // Match CSS transition duration
  }, [])

  const hideGratitudeMessage = useCallback(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Start closing animation
    setAnimationState('closing')

    // Wait for animation to complete, then hide content
    animationTimeoutRef.current = setTimeout(() => {
      setShowContent(false)
      setAnimationState('closed')
    }, 200) // Match CSS transition duration
  }, [])

  const showGratitudeMessage = useCallback(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    setShowContent(true)
    setAnimationState('opening')

    // Transition to open state after small delay
    const openTimeout = setTimeout(() => {
      setAnimationState('open')

      // Auto-hide
      animationTimeoutRef.current = setTimeout(() => {
        hideGratitudeMessage()
      }, 1200)
    }, 50)

    animationTimeoutRef.current = openTimeout
  }, [hideGratitudeMessage])

  const handleLike = useCallback(() => {
    if (isDisabled) return

    setIsDisabled(true)
    feedbackGivenUrls.add(generatedImageUrl)
    trackFeedback('positive')
    hideComponent() // Hide buttons immediately
    showGratitudeMessage()
  }, [isDisabled, generatedImageUrl, trackFeedback, hideComponent, showGratitudeMessage])

  const handleDislike = useCallback(() => {
    if (isDisabled) return

    setIsDisabled(true)
    feedbackGivenUrls.add(generatedImageUrl)
    trackFeedback('negative')
    hideComponent() // Hide buttons immediately
    showGratitudeMessage()
  }, [isDisabled, generatedImageUrl, trackFeedback, hideComponent, showGratitudeMessage])

  return {
    isDisabled,
    animationState,
    showContent,
    isGratitudeVisible: animationState !== 'closed',
    componentAnimationState,
    shouldShowFeedback: componentAnimationState !== 'closed',
    handleLike,
    handleDislike,
  }
}
