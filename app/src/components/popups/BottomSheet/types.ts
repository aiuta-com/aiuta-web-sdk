import { ReactNode } from 'react'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  /**
   * Extend the drag area down over the header (e.g. a title above a list) so
   * the sheet can be dragged by it. Off by default so the grabber doesn't
   * cover the top control when the sheet is just buttons.
   */
  tallGrabber?: boolean
}
