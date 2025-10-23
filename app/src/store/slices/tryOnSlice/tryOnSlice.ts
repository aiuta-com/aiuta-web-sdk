import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { TryOnImage } from '@/models'
import { isNewImage } from '@/models'
import type { AbortReason } from '@/utils/api/tryOnApiService'

export type GenerationStage = 'idle' | 'uploading' | 'scanning' | 'generating'

export interface TryOnState {
  isGenerating: boolean
  isAborted: boolean
  abortReason: AbortReason | null
  selectedImage: TryOnImage | null
  generationStage: GenerationStage
  operationId: string | null
  generatedImageUrl: string
  productId: string
}

const initialState: TryOnState = {
  isGenerating: false,
  isAborted: false,
  abortReason: null,
  selectedImage: null,
  generationStage: 'idle',
  operationId: null,
  generatedImageUrl: '',
  productId: '',
}

export const tryOnSlice = createSlice({
  name: 'tryOn',
  initialState,
  reducers: {
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload
      if (!action.payload) {
        state.generationStage = 'idle'
      }
    },

    setIsAborted: (state, action: PayloadAction<boolean>) => {
      state.isAborted = action.payload
      // Clear abort reason when setting isAborted to false
      if (!action.payload) {
        state.abortReason = null
      }
    },

    setAbortReason: (state, action: PayloadAction<AbortReason | null>) => {
      state.abortReason = action.payload
    },

    setSelectedImage: (state, action: PayloadAction<TryOnImage | null>) => {
      // Clean up previous object URL if exists
      if (state.selectedImage && isNewImage(state.selectedImage)) {
        URL.revokeObjectURL(state.selectedImage.localUrl)
      }
      state.selectedImage = action.payload
    },

    clearSelectedImage: (state) => {
      // Clean up object URL to prevent memory leaks
      if (state.selectedImage && isNewImage(state.selectedImage)) {
        URL.revokeObjectURL(state.selectedImage.localUrl)
      }
      state.selectedImage = null
    },

    setGenerationStage: (state, action: PayloadAction<GenerationStage>) => {
      state.generationStage = action.payload
    },

    setOperationId: (state, action: PayloadAction<string | null>) => {
      state.operationId = action.payload
    },

    setGeneratedImageUrl: (state, action: PayloadAction<string>) => {
      state.generatedImageUrl = action.payload
    },

    clearGeneratedImageUrl: (state) => {
      state.generatedImageUrl = ''
    },

    setProductId: (state, action: PayloadAction<string>) => {
      state.productId = action.payload
    },

    resetTryOnState: (state) => {
      // Clean up object URL
      if (state.selectedImage && isNewImage(state.selectedImage)) {
        URL.revokeObjectURL(state.selectedImage.localUrl)
      }
      // Reset to initial state
      Object.assign(state, initialState)
    },
  },
})
