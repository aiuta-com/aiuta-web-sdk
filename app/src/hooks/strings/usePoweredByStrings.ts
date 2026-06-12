import { useRpc } from '@/contexts'

/**
 * Hook for getting localized PoweredBy strings with fallbacks
 */
export const usePoweredByStrings = () => {
  const rpc = useRpc()

  const strings = rpc.config.userInterface?.theme?.poweredBy?.strings

  return {
    // The AIUTA wordmark logo is rendered next to this text (see PoweredBy)
    poweredByAiuta: strings?.poweredByAiuta ?? 'Powered by',
  }
}
