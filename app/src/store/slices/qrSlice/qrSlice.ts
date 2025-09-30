import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface QrState {
  token: string
  isLoading: boolean
}

const initialState: QrState = {
  token: '',
  isLoading: false,
}

export const qrSlice = createSlice({
  name: 'qr',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    clearToken: (state) => {
      state.token = ''
    },

    resetQrState: (state) => {
      Object.assign(state, initialState)
    },
  },
})
