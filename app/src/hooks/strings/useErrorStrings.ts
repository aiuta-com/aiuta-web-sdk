import { useRpc } from '@/contexts'

/**
 * Hook for getting localized error-related strings with fallbacks
 */
export const useErrorStrings = () => {
  const rpc = useRpc()

  const strings = rpc.config.userInterface?.theme?.errorSnackbar?.strings

  return {
    defaultErrorMessage:
      strings?.defaultErrorMessage ?? 'Something went wrong.\nPlease try again later',
    tryAgainButton: strings?.tryAgainButton ?? 'Try Again',
  }
}
