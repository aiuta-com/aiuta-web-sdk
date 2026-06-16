import { ReactNode } from 'react'

export interface FlexProps {
  children: ReactNode
  containerClassName?: string
  contentClassName?: string
  /**
   * Fill the container edge-to-edge instead of fitting an aspect-ratio box.
   * Drops the aspect-ratio and the max-height/width cap so the content fills the
   * inset area (the callers' full-bleed image preview).
   */
  fill?: boolean
}
