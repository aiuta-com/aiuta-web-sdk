import { RootState } from '@/store/store'

export const isMobileSelector = (state: RootState) => state.app.isMobile
export const isAppVisibleSelector = (state: RootState) => state.app.isAppVisible
