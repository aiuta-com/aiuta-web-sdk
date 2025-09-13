import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CurrentTryOnImage {
  id: string
  url: string
  localUrl: string
}

export interface TryOnState {
  isGenerating: boolean
  isAborted: boolean
  currentImage: CurrentTryOnImage
  operationId: string | null
  generatedImageUrl: string
}

const initialState: TryOnState = {
  isGenerating: false,
  isAborted: false,
  currentImage: { id: '', url: '', localUrl: '' },
  operationId: null,
  generatedImageUrl: '',
}

export const tryOnSlice = createSlice({
  name: 'tryOn',
  initialState,
  reducers: {
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload
    },

    setIsAborted: (state, action: PayloadAction<boolean>) => {
      state.isAborted = action.payload
    },

    setCurrentImage: (state, action: PayloadAction<CurrentTryOnImage>) => {
      // Clean up previous object URL if exists
      if (state.currentImage.localUrl && state.currentImage.localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.currentImage.localUrl)
      }
      state.currentImage = action.payload
    },

    clearCurrentImage: (state) => {
      // Clean up object URL to prevent memory leaks
      if (state.currentImage.localUrl && state.currentImage.localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.currentImage.localUrl)
      }
      state.currentImage = { id: '', url: '', localUrl: '' }
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

    resetTryOnState: (state) => {
      // Clean up object URL
      if (state.currentImage.localUrl && state.currentImage.localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.currentImage.localUrl)
      }
      // Reset to initial state
      Object.assign(state, initialState)
    },
  },
})
