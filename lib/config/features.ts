export interface AiutaFeatures {
  share?: Share
  onboarding?: Onboarding
}

export interface Share {
  strings?: {
    shareButton?: string
    sharePageTitle?: string
    copyButton?: string
    downloadButton?: string
  }
}

export interface Onboarding {
  howItWorksPage?: OnboardingHowItWorksPage
  bestResultsPage?: OnboardingBestResultsPage
  strings?: {
    onboardingButtonNext?: string
    onboardingButtonStart?: string
  }
}

export interface OnboardingHowItWorksPage {
  strings?: {
    onboardingHowItWorksTitle?: string
    onboardingHowItWorksDescription?: string
  }
}

export interface OnboardingBestResultsPage {
  strings?: {
    onboardingBestResultsTitle?: string
    onboardingBestResultsDescription?: string
  }
}
