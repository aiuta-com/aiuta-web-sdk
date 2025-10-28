import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Feedback strings with fallbacks
 */
export const useFeedbackStrings = () => {
  const rpc = useRpc()

  const feedbackConfig = rpc.config.features?.tryOn?.feedback
  const strings = feedbackConfig?.strings

  return {
    feedbackGratitudeText: strings?.feedbackGratitudeText ?? 'Thank you for\nyour feedback!',
  }
}
