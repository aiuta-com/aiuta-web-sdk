import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AiutaMode } from '@lib/config'
import type { OnboardingCompletedModes } from '@/hooks/data/useOnboardingData'

export interface OnboardingState {
  currentStep: number
  completedModes: OnboardingCompletedModes
}

const initialState: OnboardingState = {
  currentStep: 0,
  completedModes: {}, // Will be loaded via useOnboardingData
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

    setCompletedModes: (state, action: PayloadAction<OnboardingCompletedModes>) => {
      state.completedModes = action.payload
      // Storage is handled by React Query mutations
    },

    setModeCompleted: (state, action: PayloadAction<AiutaMode>) => {
      state.completedModes[action.payload] = true
      // Storage is handled by React Query mutations
    },

    resetOnboarding: (state) => {
      state.currentStep = 0
      state.completedModes = {}
      // Storage is handled by React Query mutations
    },
  },
})
