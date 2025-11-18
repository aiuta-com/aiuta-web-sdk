export interface UploadsHistorySheetProps {
  onUploadNew: () => void
  onImageSelect: (id: string, url: string) => void
  onSelectModel?: () => void
}
