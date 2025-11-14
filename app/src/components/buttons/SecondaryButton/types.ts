import { MouseEventHandler } from 'react'

export type SecondaryButtonProps = {
  /** Button text content */
  text: string
  /** Optional icon SVG to display before text */
  icon?: string
  /** Button shape size - determines global class */
  shape?: 'S' | 'M'
  /** Button variant - default or on-dark background */
  variant?: 'default' | 'on-dark'
  /** Additional CSS classes */
  classNames?: string
  /** Click handler */
  onClick: MouseEventHandler<HTMLButtonElement>
}
