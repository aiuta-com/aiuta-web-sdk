import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { InputImage } from '@lib/models'
import { UploadsStorage } from '@/utils'

export interface ImageToTryOn extends InputImage {
  localUrl?: string
  file?: File
}

export interface UploadsState {
  inputImages: Array<InputImage>
  fullScreenImageUrl: string | null
  isSelecting: boolean
  isBottomSheetOpen: boolean
}

const initialState: UploadsState = {
  inputImages: UploadsStorage.getInputImages(),
  fullScreenImageUrl: null,
  isSelecting: false,
  isBottomSheetOpen: false,
}

export const uploadsSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    showImageFullScreen: (state, action: PayloadAction<string | null>) => {
      state.fullScreenImageUrl = action.payload
    },

    setInputImages: (state, action: PayloadAction<InputImage[]>) => {
      const images = action.payload
      state.inputImages = images
      UploadsStorage.saveInputImages(images)
    },

    addInputImage: (state, action: PayloadAction<InputImage>) => {
      const newImage = action.payload
      const updatedImages = UploadsStorage.addInputImage(newImage)
      state.inputImages = updatedImages
    },

    setIsSelecting: (state, action: PayloadAction<boolean>) => {
      state.isSelecting = action.payload
    },

    setIsBottomSheetOpen: (state, action: PayloadAction<boolean>) => {
      state.isBottomSheetOpen = action.payload
    },
  },
})
