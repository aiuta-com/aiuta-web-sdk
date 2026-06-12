import { RootState } from '@/store/store'

export const onboardingCurrentStepSelector = (state: RootState) => state.onboarding.currentStep
export const onboardingCompletedModesSelector = (state: RootState) =>
  state.onboarding.completedModes
