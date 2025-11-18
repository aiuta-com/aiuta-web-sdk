export type UploadPromptProps = {
  /** Callback function when upload button is clicked */
  onClick: () => void
  /** Callback function when models button is clicked (optional, hides button if not provided) */
  onModelsClick?: () => void
}
