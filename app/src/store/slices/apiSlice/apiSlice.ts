import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ApiState {
  apiKey: string
  subscriptionId: string
}

const initialState: ApiState = {
  apiKey: '',
  subscriptionId: '',
}

export const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload
    },

    setSubscriptionId: (state, action: PayloadAction<string>) => {
      state.subscriptionId = action.payload
    },

    clearApiData: (state) => {
      state.apiKey = ''
      state.subscriptionId = ''
    },
  },
})
