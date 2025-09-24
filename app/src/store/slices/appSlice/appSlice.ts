import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AppState {
  isMobile: boolean
  isInitialized: boolean
  hasFooter: boolean
  isAppVisible: boolean
}

const initialState: AppState = {
  isMobile: false,
  isInitialized: false,
  hasFooter: true,
  isAppVisible: false, // Start hidden to allow CSS transition
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload
    },

    setIsInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload
    },

    setHasFooter: (state, action: PayloadAction<boolean>) => {
      state.hasFooter = action.payload
    },

    setIsAppVisible: (state, action: PayloadAction<boolean>) => {
      state.isAppVisible = action.payload
    },

    resetAppState: (state) => {
      Object.assign(state, initialState)
    },
  },
})
