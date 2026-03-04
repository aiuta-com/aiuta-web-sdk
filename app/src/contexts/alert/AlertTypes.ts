export type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

export interface AlertContextValue {
  showAlert: (message: string, buttonText: string, onClose?: () => void) => void
  closeAlert: () => void
  discardAlert: () => void
}

export interface AlertStateContextValue {
  animationState: AnimationState
  showContent: boolean
  message: string
  buttonText: string
  isVisible: boolean
}
