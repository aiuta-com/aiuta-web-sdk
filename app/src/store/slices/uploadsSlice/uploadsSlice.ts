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
}

const initialState: UploadsState = {
  inputImages: UploadsStorage.getInputImages(),
  fullScreenImageUrl: null,
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
  },
})
