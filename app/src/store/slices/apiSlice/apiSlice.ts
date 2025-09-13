import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ApiEndpointData {
  apiKey: string
  subscriptionId: string
  jwtToken: string
}

export interface ApiState {
  endpointData: ApiEndpointData
}

const initialState: ApiState = {
  endpointData: {
    apiKey: '',
    subscriptionId: '',
    jwtToken: '',
  },
}

export const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setEndpointData: (state, action: PayloadAction<ApiEndpointData>) => {
      state.endpointData = action.payload
    },

    updateEndpointData: (state, action: PayloadAction<Partial<ApiEndpointData>>) => {
      state.endpointData = { ...state.endpointData, ...action.payload }
    },

    setApiKey: (state, action: PayloadAction<string>) => {
      state.endpointData.apiKey = action.payload
    },

    setSubscriptionId: (state, action: PayloadAction<string>) => {
      state.endpointData.subscriptionId = action.payload
    },

    setJwtToken: (state, action: PayloadAction<string>) => {
      state.endpointData.jwtToken = action.payload
    },

    clearEndpointData: (state) => {
      state.endpointData = {
        apiKey: '',
        subscriptionId: '',
        jwtToken: '',
      }
    },
  },
})
