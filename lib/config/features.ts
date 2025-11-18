export interface AiutaFeatures {
  onboarding?: Onboarding
  imagePicker?: ImagePicker
  tryOn?: TryOn
  share?: Share
  consent?: ConsentStandaloneOnboardingPage
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
  images?: {
    onboardingHowItWorksItems?: Array<{
      itemPhoto?: string
      itemPreview?: string
    }>
    onboardingHowItWorksDesktop?: string
  }

  strings?: {
    onboardingHowItWorksTitle?: string
    onboardingHowItWorksDescription?: string
  }
}

export interface OnboardingBestResultsPage {
  images?: {
    onboardingBestResultsDesktop?: string
    onboardingBestResultsMobile?: string
  }

  strings?: {
    onboardingBestResultsTitle?: string
    onboardingBestResultsDescription?: string
  }
}

export interface ImagePicker {
  qrPrompt?: ImagePickerQrPrompt
  qrUpload?: ImagePickerQrUpload
  uploadsHistory?: ImagePickerUploadsHistory
  predefinedModels?: ImagePickerPredefinedModels
  strings?: {
    imagePickerTitle?: string
    imagePickerDescription?: string
    imagePickerButtonUploadPhoto?: string
  }
}

export interface ImagePickerQrPrompt {
  strings?: {
    qrPromptHint?: string
    qrPromptDescription?: string
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
    uploadsHistoryButtonAddNew?: string
    uploadsHistoryTitle?: string
    uploadsHistoryButtonChangePhoto?: string
  }
}

export interface ImagePickerPredefinedModels {
  data?: {
    preferredCategoryId?: string
  }
  strings?: {
    predefinedModelsTitle?: string
    predefinedModelsOr?: string
    predefinedModelsEmptyListError?: string
    predefinedModelCategories?: Record<string, string>
  }
}

export interface TryOn {
  loadingPage?: TryOnLoadingPage
  inputImageValidation?: TryOnInputImageValidation
  fitDisclaimer?: TryOnFitDisclaimer
  feedback?: TryOnFeedback
  generationsHistory?: TryOnGenerationsHistory
  otherPhoto?: TryOnWithOtherPhoto

  strings?: {
    tryOnPageTitle?: string
    tryOn?: string
  }
}

export interface TryOnLoadingPage {
  strings?: {
    tryOnLoadingStatusUploadingImage?: string
    tryOnLoadingStatusScanningBody?: string
    tryOnLoadingStatusGeneratingOutfit?: string
  }
}

export interface TryOnInputImageValidation {
  strings?: {
    invalidInputImageDescription?: string
    invalidInputImageChangePhotoButton?: string
    // Specific abort reason messages
    noPeopleDetectedDescription?: string
    tooManyPeopleDetectedDescription?: string
    childDetectedDescription?: string
  }
}

export interface TryOnFitDisclaimer {
  strings?: {
    fitDisclaimerTitle?: string
  }
}

export interface TryOnFeedback {
  strings?: {
    feedbackGratitudeText?: string
  }
}

export interface TryOnGenerationsHistory {
  strings?: {
    generationsHistoryPageTitle?: string
  }
}

export interface TryOnWithOtherPhoto {
  icons?: {
    changePhoto24?: string
  }
}

export interface ConsentStandaloneOnboardingPage {
  strings?: {
    consentTitle?: string
    consentDescriptionHtml?: string
    consentButtonAccept?: string
  }
  data?: {
    consents?: Consent[]
  }
}

export interface Consent {
  id: string
  type: ConsentType
  html: string
}

export enum ConsentType {
  explicitRequired = 'explicitRequired',
  explicitOptional = 'explicitOptional',
}
