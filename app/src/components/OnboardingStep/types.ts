import { ReactNode } from 'react'

export type OnboardingStepState = 'inactive' | 'active' | 'completed'

export interface OnboardingStepProps {
  /** Current state of the step */
  state: OnboardingStepState
  /** Step title */
  title?: string
  /** Step description */
  description?: string
  /** Image URL for the step */
  imageUrl?: string
  /** Custom content (for Consent step or other complex content) */
  children?: ReactNode
  /** Whether this is the first step (different positioning) */
  isFirst?: boolean
  /** Custom className */
  className?: string
}
