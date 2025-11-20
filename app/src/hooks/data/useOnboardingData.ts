import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStorageBackend } from '@/contexts'

/**
 * Query key factory for onboarding
 */
const onboardingKeys = {
  completed: ['onboarding', 'completed'] as const,
}

/**
 * Hook to fetch onboarding completion status
 */
export function useOnboardingData() {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: onboardingKeys.completed,
    queryFn: () => backend.getOnboardingCompleted(),
  })
}

/**
 * Hook to set onboarding completion status
 */
export function useSetOnboardingCompleted() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (completed: boolean) => backend.setOnboardingCompleted(completed),
    onSuccess: (_, completed) => {
      // Update cache immediately
      queryClient.setQueryData(onboardingKeys.completed, completed)
    },
  })
}

/**
 * Hook to clear onboarding status
 */
export function useClearOnboarding() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backend.clearOnboarding(),
    onSuccess: () => {
      // Reset to false
      queryClient.setQueryData(onboardingKeys.completed, false)
    },
  })
}
