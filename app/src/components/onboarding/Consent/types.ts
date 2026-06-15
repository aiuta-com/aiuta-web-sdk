export interface ConsentProps {
  /** Custom className for styling variants */
  className?: string
  /** Callback when consent validation state changes */
  onValidationChange?: (isValid: boolean) => void
  /**
   * Popup layout: smaller title and content-sized height/padding (the popup
   * provides its own padding), instead of the full-slide onboarding layout.
   */
  compact?: boolean
  /**
   * Persist checked consents automatically on every change (default). The
   * popup turns this off and saves only when the user confirms, so closing it
   * after toggling a box does not silently accept the consent.
   */
  autoSave?: boolean
}

/** Imperative handle to persist the current selection (used by ConsentPopup) */
export interface ConsentHandle {
  save: () => void
}
