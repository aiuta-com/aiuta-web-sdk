import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { GeneratedImage } from '@lib/models'
import { GenerationsStorage } from '@/utils'

export interface GenerationsState {
  selectedImages: Array<string>
  generatedImages: Array<GeneratedImage>
  isSelecting: boolean
}

const initialState: GenerationsState = {
  selectedImages: [],
  generatedImages: GenerationsStorage.getGeneratedImages(),
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

    setGeneratedImages: (state, action: PayloadAction<GeneratedImage[]>) => {
      const images = action.payload
      state.generatedImages = images
      GenerationsStorage.saveGeneratedImages(images)
    },

    addGeneratedImage: (state, action: PayloadAction<GeneratedImage>) => {
      const newImage = action.payload
      const updatedImages = GenerationsStorage.addGeneratedImage(newImage)
      state.generatedImages = updatedImages
    },

    setIsSelecting: (state, action: PayloadAction<boolean>) => {
      state.isSelecting = action.payload
    },
  },
})
