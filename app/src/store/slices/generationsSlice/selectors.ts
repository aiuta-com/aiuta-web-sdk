import { RootState } from '@/store/store'

export const selectedImagesSelector = (state: RootState) => state.generations.selectedImages
export const generationsIsSelectingSelector = (state: RootState) => state.generations.isSelecting
