import { RootState } from '@/store/store'

export const onboardingCurrentStepSelector = (state: RootState) => state.onboarding.currentStep
export const onboardingIsCompletedSelector = (state: RootState) => state.onboarding.isCompleted
