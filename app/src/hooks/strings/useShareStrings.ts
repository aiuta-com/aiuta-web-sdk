import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Share feature strings with fallbacks
 */
export const useShareStrings = () => {
  const rpc = useRpc()

  const strings = rpc.config.features?.share?.strings

  return {
    shareButton: strings?.shareButton ?? 'Share',
    sharePageTitle: strings?.sharePageTitle ?? 'Share with',
    copyButton: strings?.copyButton ?? 'Copy',
    copiedButton: strings?.copiedButton ?? 'Copied',
    copyError: strings?.copyError ?? "Couldn't copy the link",
    downloadButton: strings?.downloadButton ?? 'Download',
  }
}
