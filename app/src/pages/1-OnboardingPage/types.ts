// OnboardingPage doesn't need props currently - it manages its own state
export type OnboardingPageProps = Record<string, never>

export interface OnboardingStepData {
  title: string
  description: string
  imageUrl: string
  miniImageUrl?: string // For mobile carousel
}

export type OnboardingStepNumber = 0 | 1 | 2
