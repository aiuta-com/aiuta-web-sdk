import { ReactNode } from 'react'

export type OnboardingSlideState = 'pending' | 'active' | 'completed'

export interface OnboardingSlideProps {
  /** Current state of the slide */
  state: OnboardingSlideState
  /** Slide content */
  children: ReactNode
}
