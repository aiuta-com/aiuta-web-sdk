import { ReactElement } from 'react'

/**
 * Props for the PrimaryButton component
 */
export type PrimaryButtonProps = {
  /** Whether the button is disabled */
  disabled?: boolean
  /** Click handler */
  onClick: () => void
  /** Additional CSS class names */
  className?: string
  /** Whether button should use max width behavior */
  maxWidth?: boolean
  /** Button content */
  children: string | ReactElement
}
