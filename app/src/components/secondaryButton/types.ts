import { MouseEventHandler } from 'react'

export type SecondaryButtonProps = {
  /** Button text content */
  text: string
  /** Optional icon URL to display before text */
  iconUrl?: string
  /** Additional CSS classes */
  classNames?: string
  /** Click handler */
  onClick: MouseEventHandler<HTMLButtonElement>
}
