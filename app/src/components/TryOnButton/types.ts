import { ReactElement } from 'react'

/**
 * Props for the TryOnButton component
 * Specialized button for "Try On" actions only
 */
export type TryOnButtonProps = {
  /** Click handler */
  onClick: () => void
  /** Whether to show the Try On icon (default: true) */
  isShowTryOnIcon?: boolean
  /** Button content - typically "Try On" */
  children: string | ReactElement
}
