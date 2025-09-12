import { RootState } from '@/store/store'

export const currentImageSelector = (state: RootState) => state.uploads.currentImage

export const fullScreenImageUrlSelector = (state: RootState) => state.uploads.fullScreenImageUrl

export const inputImagesSelector = (state: RootState) => state.uploads.inputImages
