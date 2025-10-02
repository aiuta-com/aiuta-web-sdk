import type { Consent } from '@lib/config/features'

export interface ConsentCheckboxProps {
  /** Consent configuration object */
  consent: Consent
  /** Whether the checkbox is checked */
  checked?: boolean
  /** Callback when checkbox state changes */
  onChange?: (checked: boolean) => void
}
