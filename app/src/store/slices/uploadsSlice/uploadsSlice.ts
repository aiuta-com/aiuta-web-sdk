import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Uploads UI State (data is managed by React Query)
 */
export interface UploadsState {
  selectedImages: Array<string>
  fullScreenImageUrl: string | null
  isSelecting: boolean
  isBottomSheetOpen: boolean
}

const initialState: UploadsState = {
  selectedImages: [],
  fullScreenImageUrl: null,
  isSelecting: false,
  isBottomSheetOpen: false,
}

export const uploadsSlice = createSlice({
  name: 'uploads',
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

    showImageFullScreen: (state, action: PayloadAction<string | null>) => {
      state.fullScreenImageUrl = action.payload
    },

    setIsSelecting: (state, action: PayloadAction<boolean>) => {
      state.isSelecting = action.payload
    },

    setIsBottomSheetOpen: (state, action: PayloadAction<boolean>) => {
      state.isBottomSheetOpen = action.payload
    },
  },
})
