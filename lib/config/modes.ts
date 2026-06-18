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

/**
 * Per-call options for `aiuta.tryOn`. Passed as the second argument instead of a
 * bare mode string (which is still accepted for backward compatibility).
 */
export interface AiutaTryOnOptions {
  /** Try-on mode driving the UI context; defaults to 'general'. */
  mode?: AiutaMode
  /**
   * Gender of the product being tried on. Selects the matching predefined-model
   * category by default (the category id equals the gender tag, e.g. "male" /
   * "female"), overriding `predefinedModels.data.preferredCategoryId` for this
   * try-on. Omit to fall back to the configured preference.
   */
  gender?: string
}

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
      /** Labels for the view groups, keyed by view (full-height/bird-view/side-view) */
      predefinedModelShoesGroups?: Record<string, string>
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
