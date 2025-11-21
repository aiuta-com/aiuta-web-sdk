import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { GeneratedImage } from '@lib/models'

/**
 * Generations UI State
 * - currentResults: Fresh generated images (not yet persisted to storage)
 * - selectedImages: Images selected for deletion in gallery
 * - isSelecting: Selection mode in gallery
 */
export interface GenerationsState {
  currentResults: GeneratedImage[]
  selectedImages: Array<string>
  isSelecting: boolean
}

const initialState: GenerationsState = {
  currentResults: [],
  selectedImages: [],
  isSelecting: false,
}

export const generationsSlice = createSlice({
  name: 'generations',
  initialState,
  reducers: {
    // Fresh generation results (immediate, no storage delay)
    setCurrentResults: (state, action: PayloadAction<GeneratedImage[]>) => {
      state.currentResults = action.payload
    },

    addCurrentResult: (state, action: PayloadAction<GeneratedImage>) => {
      state.currentResults.push(action.payload)
    },

    clearCurrentResults: (state) => {
      state.currentResults = []
    },

    // Selection state for gallery
    setSelectedImages: (state, action: PayloadAction<string[]>) => {
      state.selectedImages = action.payload
    },

    toggleSelectedImage: (state, action: PayloadAction<string>) => {
      const imageId = action.payload
      if (state.selectedImages.includes(imageId)) {
        state.selectedImages = state.selectedImages.filter((id) => id !== imageId)
      } else {
        state.selectedImages.push(imageId)
      }
    },

    clearSelectedImages: (state) => {
      state.selectedImages = []
    },

    setIsSelecting: (state, action: PayloadAction<boolean>) => {
      state.isSelecting = action.payload
    },
  },
})
