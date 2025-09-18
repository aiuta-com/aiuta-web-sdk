export interface ConsentProps {
  /** Whether the consent checkbox is checked */
  isChecked: boolean
  /** Callback when checkbox state changes */
  onCheckChange: (checked: boolean) => void
  /** Custom className for styling variants */
  className?: string
}
