import { MouseEventHandler, ReactElement } from 'react'

export type SecondaryButtonProps = {
  /** Button content */
  children: string | ReactElement
  /** Optional icon SVG to display before text */
  icon?: string
  /** Button shape size - determines global class */
  shape?: 'S' | 'M'
  /** Button variant - default or on-dark background */
  variant?: 'default' | 'on-dark'
  /** Whether button should use max width behavior */
  maxWidth?: boolean
  /** Additional CSS classes */
  classNames?: string
  /** Click handler */
  onClick: MouseEventHandler<HTMLButtonElement>
}
