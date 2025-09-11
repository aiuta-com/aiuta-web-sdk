import { RootState } from '@/store/store'

export const selectedImagesSelector = (state: RootState) => state.generate.selectedImages
export const generatedImagesSelector = (state: RootState) => state.generate.generatedImages
export const recentlyPhotosSelector = (state: RootState) => state.generate.recentlyPhotos
export const isStartGenerationSelector = (state: RootState) => state.generate.isStartGeneration
