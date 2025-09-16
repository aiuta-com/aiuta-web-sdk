import { ReactElement } from 'react'

/**
 * Props for the PrimaryButton component
 */
export type PrimaryButtonProps = {
  /** Whether the button is disabled */
  disabled?: boolean
  /** Click handler */
  onClick: () => void
  /** Optional icon URL to display before text */
  iconUrl?: string
  /** Button content */
  children: string | ReactElement
}
