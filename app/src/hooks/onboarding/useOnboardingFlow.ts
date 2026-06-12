import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { useRpc } from '@/contexts'
import { onboardingSlice, onboardingCompletedModesSelector } from '@/store/slices/onboardingSlice'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'
import { useConsentData } from '@/hooks/data'
import { useSetOnboardingModeCompleted } from '@/hooks/data/useOnboardingData'
import { ConsentType } from '@lib/config/features'
import type { AiutaMode } from '@lib/config'
import {
  computeOnboardingSlides,
  completionForSlide,
  type OnboardingSlideId,
} from '@/utils/onboarding/onboardingFlow'
import { DEFAULT_CONSENT } from './useConsentManagement'

/**
 * Mode-aware onboarding flow: which slides to show for the current session
 * and marking per-mode completion at the right moments.
 */
export const useOnboardingFlow = () => {
  const rpc = useRpc()
  const dispatch = useAppDispatch()
  const mode = useAppSelector(tryOnModeSelector)
  const completedModes = useAppSelector(onboardingCompletedModesSelector)
  const { data: obtainedConsentIds = [] } = useConsentData()
  const { mutate: persistModeCompleted } = useSetOnboardingModeCompleted()

  // Same effective consent list as useConsentManagement (incl. the default)
  const configConsents = rpc.config.features?.consent?.data?.consents
  const hasPendingConsents = useMemo(() => {
    const consents = configConsents?.length ? configConsents : [DEFAULT_CONSENT]
    return consents
      .filter((consent) => consent.type === ConsentType.explicitRequired)
      .some((consent) => !obtainedConsentIds.includes(consent.id))
  }, [configConsents, obtainedConsentIds])

  const slides = useMemo(
    () =>
      computeOnboardingSlides({
        mode,
        config: rpc.config,
        completedModes,
        hasPendingConsents,
      }),
    [mode, rpc.config, completedModes, hasPendingConsents],
  )

  /**
   * Completion is written exactly on the Next press of each slide (not at the
   * flow end), so abandoning later slides keeps what has already been seen.
   * Returns the mode that was completed, if any.
   */
  const markSlideCompleted = useCallback(
    (slideId: OnboardingSlideId): AiutaMode | null => {
      const completedMode = completionForSlide(slideId, rpc.config)
      if (completedMode) {
        dispatch(onboardingSlice.actions.setModeCompleted(completedMode))
        persistModeCompleted(completedMode)
      }
      return completedMode
    },
    [dispatch, persistModeCompleted, rpc.config],
  )

  return { slides, markSlideCompleted }
}
