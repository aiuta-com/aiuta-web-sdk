import { createSlice } from '@reduxjs/toolkit'

const isOnboardingDone =
  typeof window !== 'undefined' && JSON.parse(localStorage.getItem('isOnboarding') || 'false')

interface configSliceState {
  qrToken: string
  isMobile: boolean
  isOpenSwip: boolean
  isShowFooter: boolean
  isShowSpinner: boolean
  isInitialized: boolean
  onboardingSteps: number
  isShowQrSpinner: boolean
  isOnboardingDone: boolean
  isSelectHistoryImages: boolean
  isSelectPreviouselyImages: boolean
  aiutaEndpointData: {
    skuId: string
    apiKey: string
    userId: string
    jwtToken: string
  }
}

const initialState: configSliceState = {
  qrToken: '',
  isMobile: false,
  isOpenSwip: false,
  onboardingSteps: 0,
  isShowFooter: true,
  isShowSpinner: false,
  isInitialized: false,
  isShowQrSpinner: false,
  isSelectHistoryImages: false,
  isSelectPreviouselyImages: false,
  isOnboardingDone: isOnboardingDone,
  aiutaEndpointData: {
    skuId: '',
    apiKey: '',
    userId: '',
    jwtToken: '',
  },
}

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setQrToken: (state, { payload }) => {
      state.qrToken = payload
    },
    setIsMobile: (state, { payload }) => {
      state.isMobile = payload
    },
    setIsOpenSwip: (state, { payload }) => {
      state.isOpenSwip = payload
    },
    setIsShowQrSpinner: (state, { payload }) => {
      state.isShowQrSpinner = payload
    },
    setIsInitialized: (state, { payload }) => {
      state.isInitialized = payload
    },
    setIsShowSpinner: (state, { payload }) => {
      state.isShowSpinner = payload
    },
    setIsShowFooter: (state, { payload }) => {
      state.isShowFooter = payload
    },
    setIsOnboardingDone: (state, { payload }) => {
      state.isOnboardingDone = payload
    },
    setAiutaEndpointData: (state, { payload }) => {
      state.aiutaEndpointData = payload
    },
    setOnboardingSteps: (state, { payload }) => {
      if (payload) {
        state.onboardingSteps = payload
      } else {
        state.onboardingSteps++
      }
    },
    setIsSelectHistoryImages: (state, { payload }) => {
      state.isSelectHistoryImages = payload
    },
    setIsSelectPreviouselyImages: (state, { payload }) => {
      state.isSelectPreviouselyImages = payload
    },
  },
})
