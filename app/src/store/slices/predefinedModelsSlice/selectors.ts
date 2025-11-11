import { RootState } from '@/store/store'

export const modelsSelector = (state: RootState) => state.predefinedModels.categories
export const modelsLoadingSelector = (state: RootState) => state.predefinedModels.isLoading
export const modelsLoadedSelector = (state: RootState) => state.predefinedModels.isLoaded
export const modelsErrorSelector = (state: RootState) => state.predefinedModels.error
export const modelsEtagSelector = (state: RootState) => state.predefinedModels.etag
export const modelsRetryRequestedSelector = (state: RootState) =>
  state.predefinedModels.retryRequested
