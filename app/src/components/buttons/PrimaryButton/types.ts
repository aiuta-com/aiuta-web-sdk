import { ReactNode } from 'react'

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
  /** Compact height: 36px min-height instead of the default 50px */
  compact?: boolean
  /** Button shape size - determines global class */
  shape?: 'S' | 'M'
  /** Button content (label, optionally with an icon) */
  children: ReactNode
}
