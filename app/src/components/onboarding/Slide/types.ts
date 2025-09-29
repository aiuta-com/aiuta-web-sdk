import { ReactNode } from 'react'

export type SlideState = 'pending' | 'active' | 'completed'

export interface SlideProps {
  /** Current state of the slide */
  state: SlideState
  /** Slide content */
  children: ReactNode
}
