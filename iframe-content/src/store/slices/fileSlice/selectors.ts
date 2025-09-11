import { RootState } from '@/store/store'

export const uploadedViewFileSelector = (state: RootState) => state.file.uploadedViewFile

export const fullScreenImageUrlSelector = (state: RootState) => state.file.fullScreenModalImageUrl
