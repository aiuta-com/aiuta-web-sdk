import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { InputImage } from '@lib/models'
import { UploadsStorage } from '@/utils'

interface ImageToTryOn extends InputImage {
  localUrl?: string
  file?: File
}

interface UploadsSliceState {
  currentImage: Pick<ImageToTryOn, 'id' | 'url'> & { localUrl: string }
  inputImages: Array<InputImage>
  fullScreenImageUrl: string | null
}

const initialState: UploadsSliceState = {
  currentImage: { id: '', url: '', localUrl: '' },
  inputImages: UploadsStorage.getInputImages(),
  fullScreenImageUrl: null,
}

export const uploadsSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    setCurrentImage: (state, action: PayloadAction<ImageToTryOn>) => {
      const payload = action.payload

      // Clean up previous object URL if exists
      if (state.currentImage.localUrl && state.currentImage.localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.currentImage.localUrl)
      }

      if (payload.file) {
        // Create object URL for local file preview
        const localUrl = URL.createObjectURL(payload.file)
        state.currentImage = {
          id: payload.id,
          url: payload.url,
          localUrl,
        }
      } else {
        // Use server URL for both url and localUrl
        state.currentImage = {
          id: payload.id,
          url: payload.url,
          localUrl: payload.url,
        }
      }
    },

    showImageFullScreen: (state, action: PayloadAction<string | null>) => {
      state.fullScreenImageUrl = action.payload
    },

    clearCurrentImage: (state) => {
      // Clean up object URL to prevent memory leaks
      if (state.currentImage.localUrl && state.currentImage.localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.currentImage.localUrl)
      }
      state.currentImage = { id: '', url: '', localUrl: '' }
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
