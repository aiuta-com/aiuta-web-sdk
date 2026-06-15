import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { useRpc } from '@/contexts'
import { onboardingSlice, onboardingCompletedModesSelector } from '@/store/slices/onboardingSlice'
import { isMobileSelector } from '@/store/slices/appSlice'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'
import { useSetOnboardingModeCompleted } from '@/hooks/data/useOnboardingData'
import type { AiutaMode } from '@lib/config'
import {
  computeOnboardingSlides,
  completionForSlide,
  type OnboardingSlideId,
} from '@/utils/onboarding/onboardingFlow'
import { useHasPendingConsents } from './useHasPendingConsents'

/**
 * Mode-aware onboarding flow: which slides to show for the current session
 * and marking per-mode completion at the right moments.
 */
export const useOnboardingFlow = () => {
  const rpc = useRpc()
  const dispatch = useAppDispatch()
  const mode = useAppSelector(tryOnModeSelector)
  const isMobile = useAppSelector(isMobileSelector)
  const completedModes = useAppSelector(onboardingCompletedModesSelector)
  const { mutate: persistModeCompleted } = useSetOnboardingModeCompleted()

  // On mobile the consent moves out of onboarding into a popup gated by the
  // photo upload, so the slide is suppressed here (see useConsentGate).
  const hasPendingConsents = useHasPendingConsents()

  const slides = useMemo(
    () =>
      computeOnboardingSlides({
        mode,
        config: rpc.config,
        completedModes,
        hasPendingConsents,
        isMobile,
      }),
    [mode, rpc.config, completedModes, hasPendingConsents, isMobile],
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
