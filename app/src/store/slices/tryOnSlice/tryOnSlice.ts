import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AiutaMode } from '@lib/config'
import type { TryOnImage } from '@/models'
import { isNewImage } from '@/models'

export type GenerationStage = 'idle' | 'uploading' | 'scanning' | 'generating'

export interface TryOnState {
  isGenerating: boolean
  // A picked file is being prepared (resize / HEIC decode) before it can show
  isProcessingImage: boolean
  selectedImage: TryOnImage | null
  generationStage: GenerationStage
  operationId: string | null
  generatedImageUrl: string
  productIds: string[]
  // Arrives with productIds on every tryOn RPC and shares their lifecycle
  mode: AiutaMode
}

const initialState: TryOnState = {
  isGenerating: false,
  isProcessingImage: false,
  selectedImage: null,
  generationStage: 'idle',
  operationId: null,
  generatedImageUrl: '',
  productIds: [],
  mode: 'general',
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

    setIsProcessingImage: (state, action: PayloadAction<boolean>) => {
      state.isProcessingImage = action.payload
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

    setProductIds: (state, action: PayloadAction<string[]>) => {
      state.productIds = action.payload
    },

    setMode: (state, action: PayloadAction<AiutaMode>) => {
      state.mode = action.payload
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
