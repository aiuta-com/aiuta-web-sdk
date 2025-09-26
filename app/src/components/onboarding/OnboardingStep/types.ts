import { ReactNode } from 'react'

export type OnboardingStepState = 'pending' | 'active' | 'completed'

export interface OnboardingStepProps {
  /** Current state of the step */
  state: OnboardingStepState
  /** Step content */
  children: ReactNode
}
