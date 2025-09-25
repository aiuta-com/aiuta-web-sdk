export interface SelectionActionItem {
  /** Icon URL for the action button */
  iconUrl: string
  /** Accessible label for the action */
  label: string
  /** Click handler for the action */
  onClick: () => void
}

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
  /** List of action buttons to display */
  actions: SelectionActionItem[]
  /** Additional CSS class name */
  className?: string
}
