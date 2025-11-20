import { RootState } from '@/store/store'

export const selectedUploadsSelector = (state: RootState) => state.uploads.selectedImages
export const fullScreenImageUrlSelector = (state: RootState) => state.uploads.fullScreenImageUrl
export const uploadsIsSelectingSelector = (state: RootState) => state.uploads.isSelecting
export const uploadsIsBottomSheetOpenSelector = (state: RootState) =>
  state.uploads.isBottomSheetOpen
