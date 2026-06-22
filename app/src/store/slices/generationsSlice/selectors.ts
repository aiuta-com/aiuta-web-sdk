import { RootState } from '@/store/store'

export const currentResultIdSelector = (state: RootState) => state.generations.currentResultId
export const selectedImagesSelector = (state: RootState) => state.generations.selectedImages
export const generationsIsSelectingSelector = (state: RootState) => state.generations.isSelecting
