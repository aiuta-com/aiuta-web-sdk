import { MouseEventHandler } from 'react'

export type SecondaryButtonProps = {
  /** Button text content */
  text: string
  /** Optional icon SVG to display before text */
  icon?: string
  /** Button shape size - determines global class */
  shape?: 'S' | 'M'
  /** Additional CSS classes */
  classNames?: string
  /** Click handler */
  onClick: MouseEventHandler<HTMLButtonElement>
}
