import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Generations UI State (data is managed by React Query)
 */
export interface GenerationsState {
  selectedImages: Array<string>
  isSelecting: boolean
}

const initialState: GenerationsState = {
  selectedImages: [],
  isSelecting: false,
}

export const generationsSlice = createSlice({
  name: 'generations',
  initialState,
  reducers: {
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
