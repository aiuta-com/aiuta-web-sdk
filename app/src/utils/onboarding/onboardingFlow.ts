import type { AiutaConfiguration, AiutaMode } from '@lib/config'
import type { OnboardingCompletedModes } from '@/hooks/data/useOnboardingData'

/**
 * Pure decision logic for the mode-aware onboarding flow.
 *
 * Enablement convention: a missing config section keeps a slide enabled with
 * built-in defaults; an explicit null disables it.
 */

export type OnboardingSlideId = 'howItWorks' | 'bestResults' | 'shoesBestResults' | 'consent'

export interface OnboardingFlowInput {
  mode: AiutaMode
  config: AiutaConfiguration
  completedModes: OnboardingCompletedModes
  hasPendingConsents: boolean
  /** On mobile the consent is collected in a popup, not as an onboarding slide */
  isMobile: boolean
}

/**
 * Slides to show for this app session, in order. Empty list means the
 * onboarding page should be skipped entirely.
 */
export function computeOnboardingSlides(input: OnboardingFlowInput): OnboardingSlideId[] {
  const { mode, config, completedModes, hasPendingConsents, isMobile } = input

  const onboarding = config.features?.onboarding
  const generalEnabled = onboarding !== null
  const shoes = config.modes?.shoes

  const anyModeCompleted = Object.values(completedModes).some(Boolean)

  const slides: OnboardingSlideId[] = []

  // The intro is mode-agnostic: any completed onboarding means the user
  // has already seen it
  if (generalEnabled && onboarding?.howItWorksPage !== null && !anyModeCompleted) {
    slides.push('howItWorks')
  }

  if (
    mode === 'general' &&
    generalEnabled &&
    onboarding?.bestResultsPage !== null &&
    !completedModes.general
  ) {
    slides.push('bestResults')
  }

  if (
    mode === 'shoes' &&
    shoes !== null &&
    shoes?.onboardingShoesPage !== null &&
    !completedModes.shoes
  ) {
    slides.push('shoesBestResults')
  }

  // Consent collection rides along with the onboarding page on desktop, but its
  // acceptance does not count towards onboarding completion. On mobile it is
  // moved to a popup triggered by the photo upload, so the slide is skipped.
  if (hasPendingConsents && !isMobile) {
    slides.push('consent')
  }

  return slides
}

/**
 * Which mode's onboarding (if any) is completed by pressing Next on a slide.
 */
export function completionForSlide(
  slideId: OnboardingSlideId,
  config: AiutaConfiguration,
): AiutaMode | null {
  switch (slideId) {
    case 'howItWorks':
      // Counts as the whole general onboarding only when its best-results
      // slide is explicitly disabled — regardless of the current mode
      return config.features?.onboarding?.bestResultsPage === null ? 'general' : null
    case 'bestResults':
      return 'general'
    case 'shoesBestResults':
      return 'shoes'
    case 'consent':
      return null
  }
}
