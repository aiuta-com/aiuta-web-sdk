import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OnboardingStorage } from '@/utils'

export interface OnboardingState {
  currentStep: number
  isCompleted: boolean
}

const initialState: OnboardingState = {
  currentStep: 0,
  isCompleted: OnboardingStorage.getOnboardingCompleted(),
}

export const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },

    nextStep: (state) => {
      state.currentStep++
    },

    setIsCompleted: (state, action: PayloadAction<boolean>) => {
      state.isCompleted = action.payload
      OnboardingStorage.setOnboardingCompleted(action.payload)
    },

    resetOnboarding: (state) => {
      state.currentStep = 0
      state.isCompleted = false
      OnboardingStorage.setOnboardingCompleted(false)
    },
  },
})
