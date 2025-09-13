import { RootState } from '@/store/store'

export const isGeneratingSelector = (state: RootState) => state.tryOn.isGenerating
export const isAbortedSelector = (state: RootState) => state.tryOn.isAborted
export const currentTryOnImageSelector = (state: RootState) => state.tryOn.currentImage
export const operationIdSelector = (state: RootState) => state.tryOn.operationId
export const generatedImageUrlSelector = (state: RootState) => state.tryOn.generatedImageUrl
export const productIdSelector = (state: RootState) => state.tryOn.productId
