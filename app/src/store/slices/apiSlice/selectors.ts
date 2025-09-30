import { RootState } from '@/store/store'

export const apiKeySelector = (state: RootState) => state.api.apiKey
export const subscriptionIdSelector = (state: RootState) => state.api.subscriptionId
