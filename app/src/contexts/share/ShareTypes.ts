export type AnimationState = 'closed' | 'opening' | 'open' | 'closing'

export interface ShareContextType {
  modalData: { imageUrl: string } | null
  animationState: AnimationState
  isOpen: boolean
  isVisible: boolean
  openShareModal: (imageUrl: string) => void
  closeShareModal: () => void
}
