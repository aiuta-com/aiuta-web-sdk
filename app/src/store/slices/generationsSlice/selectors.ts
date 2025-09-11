import { RootState } from '@/store/store'

export const selectedImagesSelector = (state: RootState) => state.generations.selectedImages
export const generatedImagesSelector = (state: RootState) => state.generations.generatedImages
export const isGeneratingSelector = (state: RootState) => state.generations.isGenerating
