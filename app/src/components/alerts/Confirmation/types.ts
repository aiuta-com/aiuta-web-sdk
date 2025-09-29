export interface ConfirmationProps {
  /** Whether the alert is visible */
  isVisible: boolean
  /** Main confirmation message text */
  message: string
  /** Text for the left (cancel) button */
  leftButtonText: string
  /** Text for the right (confirm) button */
  rightButtonText: string
  /** Callback for left button click */
  onLeftClick: () => void
  /** Callback for right button click */
  onRightClick: () => void
}
