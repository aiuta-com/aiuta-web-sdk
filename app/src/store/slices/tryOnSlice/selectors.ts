import { RootState } from '@/store/store'

export const isGeneratingSelector = (state: RootState) => state.tryOn.isGenerating
export const isProcessingImageSelector = (state: RootState) => state.tryOn.isProcessingImage
export const selectedImageSelector = (state: RootState) => state.tryOn.selectedImage
export const generationStageSelector = (state: RootState) => state.tryOn.generationStage
export const operationIdSelector = (state: RootState) => state.tryOn.operationId
export const generatedImageUrlSelector = (state: RootState) => state.tryOn.generatedImageUrl
export const productIdsSelector = (state: RootState) => state.tryOn.productIds
export const tryOnModeSelector = (state: RootState) => state.tryOn.mode
export const tryOnPreferredCategoryIdSelector = (state: RootState) =>
  state.tryOn.preferredCategoryId
