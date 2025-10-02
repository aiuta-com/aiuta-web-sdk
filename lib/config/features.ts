export interface AiutaFeatures {
  onboarding?: Onboarding
  imagePicker?: ImagePicker
  tryOn?: TryOn
  share?: Share
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

export interface ImagePicker {
  qrPrompt?: ImagePickerQrPrompt
  qrUpload?: ImagePickerQrUpload
  uploadsHistory?: ImagePickerUploadsHistory
  strings?: {
    imagePickerButtonUploadImage?: string
  }
}

export interface ImagePickerQrPrompt {
  strings?: {
    qrPromptHint?: string
    qrPromptOr?: string
    qrPromptUploadButton?: string
  }
}

export interface ImagePickerQrUpload {
  strings?: {
    qrUploadNextButton?: string
    qrUploadSuccessTitle?: string
    qrUploadNextHint?: string
  }
}

export interface ImagePickerUploadsHistory {
  strings?: {
    uploadsHistoryButtonNewPhoto?: string
    uploadsHistoryTitle?: string
    uploadsHistoryButtonChangePhoto?: string
  }
}

export interface TryOn {
  loadingPage?: TryOnLoadingPage
  inputImageValidation?: TryOnInputImageValidation
  fitDisclaimer?: TryOnFitDisclaimer
  generationsHistory?: TryOnGenerationsHistory

  strings?: {
    tryOnPageTitle?: string
    tryOn?: string
  }
}

export interface TryOnLoadingPage {
  strings?: {
    tryOnLoadingStatusScanningBody?: string
    tryOnLoadingStatusGeneratingOutfit?: string
  }
}

export interface TryOnInputImageValidation {
  strings?: {
    invalidInputImageDescription?: string
    invalidInputImageChangePhotoButton?: string
  }
}

export interface TryOnFitDisclaimer {
  strings?: {
    fitDisclaimerTitle?: string
  }
}

export interface TryOnGenerationsHistory {
  strings?: {
    generationsHistoryPageTitle?: string
  }
}
