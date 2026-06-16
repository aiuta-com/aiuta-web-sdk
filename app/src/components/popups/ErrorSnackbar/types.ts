export interface ErrorSnackbarProps {
  onRetry?: () => void
  className?: string
  /**
   * Controlled visibility. When provided, the snackbar ignores the global
   * error slice and is driven by this prop (for a context-specific error such
   * as a failed clipboard copy in the share modal).
   */
  open?: boolean
  /** Custom message; defaults to the generic error message */
  message?: string
  /** Dismiss handler used in controlled mode */
  onClose?: () => void
}
