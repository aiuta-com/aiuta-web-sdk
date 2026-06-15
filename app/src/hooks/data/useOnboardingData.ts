import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStorageBackend } from '@/contexts'
import type { AiutaMode } from '@lib/config'

/**
 * Per-mode onboarding completion data.
 *
 * This module is the single seam between the app and wherever completion
 * statuses live — today the SDK's own storage backend, later optionally a
 * host-provided dataProvider. Everything else must go through these hooks.
 */

export type OnboardingCompletedModes = Partial<Record<AiutaMode, boolean>>

/**
 * Query key factory for onboarding
 */
const onboardingKeys = {
  modes: ['onboarding', 'modes'] as const,
}

/**
 * Hook to fetch per-mode onboarding completion statuses (all modes in one read)
 */
export function useOnboardingData() {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: onboardingKeys.modes,
    queryFn: () => backend.getOnboardingCompletedModes() as Promise<OnboardingCompletedModes>,
  })
}

/**
 * Hook to mark onboarding completed for a mode
 */
export function useSetOnboardingModeCompleted() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mode: AiutaMode) => backend.setOnboardingModeCompleted(mode),
    onSuccess: (_, mode) => {
      // Update cache immediately
      queryClient.setQueryData<OnboardingCompletedModes>(onboardingKeys.modes, (current) => ({
        ...current,
        [mode]: true,
      }))
    },
  })
}

/**
 * Hook to clear onboarding statuses
 */
export function useClearOnboarding() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backend.clearOnboarding(),
    onSuccess: () => {
      queryClient.setQueryData<OnboardingCompletedModes>(onboardingKeys.modes, {})
    },
  })
}
