import { RootState } from '@/store/store'

export const galleryModalSelector = (state: RootState) => state.galleryModal
export const galleryModalIsOpenSelector = (state: RootState) => state.galleryModal.isOpen
