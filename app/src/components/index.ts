// ===== LAYOUT COMPONENTS =====
export { Section } from './layout/Section'
export { ModalRenderer, type ModalType } from './layout/ModalRenderer'
export { PageBar } from './layout/PageBar'

// ===== UI COMPONENTS =====

// Branding
export { PoweredBy } from './ui/branding/PoweredBy'

// Buttons
export { PrimaryButton } from './ui/buttons/PrimaryButton'
export { SecondaryButton } from './ui/buttons/SecondaryButton'
export { TryOnButton } from './ui/buttons/TryOnButton'

// Forms
export { CheckboxLabel } from './ui/forms/CheckboxLabel'

// Indicators
export { Spinner } from './ui/indicators/Spinner/Spinner'
export { CountDown } from './ui/indicators/CountDown/CountDown'

// Snackbars
export { ErrorSnackbar } from './ui/snackbars/ErrorSnackbar'
export { SelectionSnackbar } from './ui/snackbars/SelectionSnackbar'

// Overlays
export { BottomSheet } from './ui/overlays/BottomSheet'

// ===== FEATURE COMPONENTS =====

// Onboarding
export { Consent } from './features/onboarding/Consent'
export { OnboardingStep } from './features/onboarding/OnboardingStep'
export { OnboardingCarousel } from './features/onboarding/OnboardingCarousel'

// Picker (Upload)
export { QrCode } from './features/picker/QrCode'
export { MobileUploadPrompt } from './features/picker/MobileUploadPrompt'
export { UploadHistorySheet } from './features/picker/UploadHistorySheet'

// Gallery
export { ImageGallery, EmptyGalleryState } from './features/gallery/ImageGallery'
export { ThumbnailList } from './features/gallery/ThumbnailList'
export { FullScreenGallery } from './features/gallery/FullScreenGallery'
export { SelectableImage } from './features/gallery/SelectableImage'
export { DeletableImage } from './features/gallery/DeletableImage'

// Try-On
export { TryOnAnimator } from './features/tryOn/TryOnAnimator'
export { ProcessingStatus } from './features/tryOn/ProcessingStatus'
export { ImageManager } from './features/tryOn/ImageManager'

// Results
export { DesktopResultActions } from './features/results/DesktopResultActions'

// Sharing
export { ShareModal } from './features/sharing/ShareModal'

// ===== ALERTS =====
export { AbortAlert } from './alerts/AbortAlert'
export { ConfirmationAlert } from './alerts/ConfirmationAlert'
