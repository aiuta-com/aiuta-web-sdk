import { RootState } from '@/store/store'

export const isMobileSelector = (state: RootState) => state.app.isMobile
export const isInitializedSelector = (state: RootState) => state.app.isInitialized
export const isLoadingSelector = (state: RootState) => state.app.isLoading
export const hasFooterSelector = (state: RootState) => state.app.hasFooter
export const isAppVisibleSelector = (state: RootState) => state.app.isAppVisible
