import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OnboardingState {
  currentStep: number
  isCompleted: boolean
}

const initialState: OnboardingState = {
  currentStep: 0,
  isCompleted: false, // Will be loaded via useOnboardingData
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
      // Storage is handled by React Query mutations
    },

    resetOnboarding: (state) => {
      state.currentStep = 0
      state.isCompleted = false
      // Storage is handled by React Query mutations
    },
  },
})
