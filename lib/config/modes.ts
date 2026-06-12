/**
 * Try-on modes
 *
 * A mode describes what kind of product the shop is trying on and switches the
 * SDK UI context accordingly (onboarding slides, photo guidance, error texts).
 * The try-on backend flow is identical for every mode.
 *
 * 'general' is the default full-body garment try-on. More modes are expected
 * later (e.g. handbags/accessories), so mode-specific configuration lives in
 * a dedicated `modes` section keyed by mode name.
 */

export type AiutaMode = 'general' | 'shoes'

export interface AiutaModes {
  /**
   * Shoes try-on. Absence keeps the mode enabled with built-in defaults;
   * explicit null disables it. Pass specific fields to override the defaults.
   */
  shoes?: AiutaShoesMode | null
}

export interface AiutaShoesMode {
  /**
   * The shoes-specific "best results" onboarding slide.
   * Explicit null disables the slide; absence keeps it enabled with defaults.
   */
  onboardingShoesPage?: ShoesOnboardingPage | null
  imagePicker?: ShoesImagePicker
  tryOn?: ShoesTryOn
}

export interface ShoesOnboardingPage {
  images?: {
    onboardingShoesBestResults?: string
  }
  strings?: {
    onboardingShoesBestResultsPageTitle?: string
    onboardingShoesBestResultsTitle?: string
    onboardingShoesBestResultsDescription?: string
  }
}

export interface ShoesImagePicker {
  predefinedModels?: {
    strings?: {
      predefinedModelShoesPageTitle?: string
      predefinedModelShoesCategories?: Record<string, string>
    }
  }
  images?: {
    /** Good-photo examples shown in the picker (first two are rendered) */
    examples?: string[]
  }
  strings?: {
    imagePickerShoesDescriptionEmpty?: string
  }
}

export interface ShoesTryOn {
  inputImageValidation?: {
    strings?: {
      insufficientTargetAreaDescription?: string
    }
  }
}
