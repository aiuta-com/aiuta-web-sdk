import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Generations UI State
 * - currentResultId: id of the just-generated image shown on /results. The
 *   image itself lives in the single persisted generations history; this is
 *   only a pointer, so deleting it anywhere makes /results fall back to the
 *   input step.
 * - selectedImages: Images selected for deletion in gallery
 * - isSelecting: Selection mode in gallery
 */
export interface GenerationsState {
  currentResultId: string | null
  selectedImages: Array<string>
  isSelecting: boolean
}

const initialState: GenerationsState = {
  currentResultId: null,
  selectedImages: [],
  isSelecting: false,
}

export const generationsSlice = createSlice({
  name: 'generations',
  initialState,
  reducers: {
    // The image to show on the results screen (the latest generation)
    setCurrentResultId: (state, action: PayloadAction<string>) => {
      state.currentResultId = action.payload
    },

    clearCurrentResultId: (state) => {
      state.currentResultId = null
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
