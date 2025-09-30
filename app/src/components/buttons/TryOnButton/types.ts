import { ReactElement } from 'react'

/**
 * Props for the TryOnButton component
 * Specialized button for "Try On" actions only
 */
export type TryOnButtonProps = {
  /** Click handler */
  onClick: () => void
  /** Button content - typically "Try On" */
  children: string | ReactElement
  /** Whether the button should be hidden (but still take up space) */
  hidden?: boolean
  /** Additional CSS class names */
  className?: string
}
