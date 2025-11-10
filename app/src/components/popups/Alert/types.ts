type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

export interface AlertProps {
  animationState: AnimationState
  showContent: boolean
  message: string
  buttonText: string
  isVisible: boolean
  onClose: () => void
  className?: string
}
