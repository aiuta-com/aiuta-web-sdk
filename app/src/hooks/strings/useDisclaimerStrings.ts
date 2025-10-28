import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Disclaimer strings with fallbacks
 */
export const useDisclaimerStrings = () => {
  const rpc = useRpc()

  const fitDisclaimerConfig = rpc.config.features?.tryOn?.fitDisclaimer
  const strings = fitDisclaimerConfig?.strings

  return {
    fitDisclaimerTitle: strings?.fitDisclaimerTitle ?? 'Results may vary from real-life fit',
  }
}
