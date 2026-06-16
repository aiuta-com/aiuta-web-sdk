import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface GalleryModalImage {
  id: string
  url: string
}

/** Which collection the modal is showing — drives whether delete is offered. */
export type GalleryModalType = 'results' | 'generations'

/**
 * Desktop fullscreen gallery modal state (the mobile fullscreen is a separate,
 * single-image flow on uploadsSlice.fullScreenImageUrl).
 */
export interface GalleryModalState {
  isOpen: boolean
  images: GalleryModalImage[]
  activeId: string | null
  modalType: GalleryModalType | null
}

const initialState: GalleryModalState = {
  isOpen: false,
  images: [],
  activeId: null,
  modalType: null,
}

export const galleryModalSlice = createSlice({
  name: 'galleryModal',
  initialState,
  reducers: {
    openGalleryModal: (
      state,
      action: PayloadAction<{
        images: GalleryModalImage[]
        activeId: string
        modalType: GalleryModalType
      }>,
    ) => {
      state.isOpen = true
      state.images = action.payload.images
      state.activeId = action.payload.activeId
      state.modalType = action.payload.modalType
    },

    setActiveGalleryImage: (state, action: PayloadAction<string>) => {
      state.activeId = action.payload
    },

    setGalleryImages: (state, action: PayloadAction<GalleryModalImage[]>) => {
      state.images = action.payload
    },

    closeGalleryModal: () => initialState,
  },
})
