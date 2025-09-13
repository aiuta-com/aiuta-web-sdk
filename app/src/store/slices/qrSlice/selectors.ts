import { RootState } from '@/store/store'

export const qrTokenSelector = (state: RootState) => state.qr.token
export const qrIsLoadingSelector = (state: RootState) => state.qr.isLoading
