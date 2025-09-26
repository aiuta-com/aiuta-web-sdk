export interface SelectionSnackbarProps {
  /** Whether the snackbar should be visible */
  isVisible: boolean
  /** Number of currently selected items */
  selectedCount: number
  /** Total number of items available for selection */
  totalCount: number
  /** Handler for cancel/close action */
  onCancel: () => void
  /** Handler for select all action */
  onSelectAll: () => void
  /** Handler for delete action (optional) */
  onDelete?: () => void
  /** Handler for download action (optional) */
  onDownload?: () => void
  /** Additional CSS class name */
  className?: string
}
