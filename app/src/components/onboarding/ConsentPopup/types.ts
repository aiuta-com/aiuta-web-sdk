export interface ConsentPopupProps {
  /** Whether the popup is visible */
  isOpen: boolean
  /** Dismiss the popup without accepting (tap outside) */
  onClose: () => void
  /** Required consents accepted — resume the gated action */
  onConfirm: () => void
}
