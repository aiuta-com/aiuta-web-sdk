import { useRpc } from '@/contexts'

/**
 * Hook for getting localized selection-related strings with fallbacks
 */
export const useSelectionStrings = () => {
  const rpc = useRpc()

  const strings = rpc.config.userInterface?.theme?.selectionSnackbar?.strings

  return {
    select: strings?.select ?? 'Select',
    cancel: strings?.cancel ?? 'Cancel',
    selectAll: strings?.selectAll ?? 'Select All',
    unselectAll: strings?.unselectAll ?? 'Unselect All',
  }
}
