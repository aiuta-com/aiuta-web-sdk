import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStorageBackend } from '@/contexts'

/**
 * Query key factory for consent
 */
const consentKeys = {
  all: ['consent'] as const,
}

/**
 * Hook to fetch consent IDs
 */
export function useConsentData() {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: consentKeys.all,
    queryFn: () => backend.getConsentIds(),
  })
}

/**
 * Hook to check if specific consent has been obtained
 */
export function useHasConsent(consentId: string) {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: [...consentKeys.all, consentId],
    queryFn: () => backend.hasConsent(consentId),
  })
}

/**
 * Hook to add consent IDs
 */
export function useAddConsents() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (consentIds: string[]) => backend.addConsentIds(consentIds),
    onSuccess: () => {
      // Invalidate all consent queries to refetch
      queryClient.invalidateQueries({ queryKey: consentKeys.all })
    },
  })
}

/**
 * Hook to clear all consents
 */
export function useClearConsents() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backend.clearConsents(),
    onSuccess: () => {
      // Clear cache
      queryClient.setQueryData(consentKeys.all, [])
    },
  })
}
