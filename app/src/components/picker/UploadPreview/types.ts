export type UploadPreviewProps = {
  /** Selected file with URL for preview */
  selectedFile: { file: File; url: string }
  /** Whether upload is in progress */
  isUploading: boolean
  /** Callback when change photo button is clicked */
  onChangePhoto: () => void
}
