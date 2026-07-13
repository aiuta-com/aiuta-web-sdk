import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStorageBackend } from '@/contexts'
import type { FitSurvey } from '@/utils/sizeFit/types'

/**
 * The last submitted Size & Fit survey — cached so a repeat visitor only
 * confirms their parameters instead of retyping them.
 */

const fitSurveyKeys = {
  survey: ['sizeFit', 'survey'] as const,
}

/**
 * Hook to fetch the cached fit survey
 */
export function useFitSurveyData() {
  const backend = useStorageBackend()

  return useQuery({
    queryKey: fitSurveyKeys.survey,
    queryFn: () => backend.getFitSurvey(),
  })
}

/**
 * Hook to save the submitted fit survey
 */
export function useSaveFitSurvey() {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (survey: FitSurvey) => backend.saveFitSurvey(survey),
    onSuccess: (_, survey) => {
      queryClient.setQueryData<FitSurvey | null>(fitSurveyKeys.survey, survey)
    },
  })
}
