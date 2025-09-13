import { RootState } from '@/store/store'

export const apiEndpointDataSelector = (state: RootState) => state.api.endpointData
export const apiKeySelector = (state: RootState) => state.api.endpointData.apiKey
export const subscriptionIdSelector = (state: RootState) => state.api.endpointData.subscriptionId
export const jwtTokenSelector = (state: RootState) => state.api.endpointData.jwtToken
