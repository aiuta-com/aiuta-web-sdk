export interface ConsentProps {
  /** Custom className for styling variants */
  className?: string
  /** Callback when consent validation state changes */
  onValidationChange?: (isValid: boolean) => void
}
