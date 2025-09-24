// ===== LAYOUT COMPONENTS =====
export { Section } from './layout/Section'
export { PageBar } from './layout/PageBar'
export { AppContainer } from './layout/AppContainer'
export { MainContent } from './layout/MainContent'
export { PoweredBy } from './layout/PoweredBy'

// ===== UI COMPONENTS =====

// Buttons
export { CheckboxLabel } from './buttons/CheckboxLabel'
export { PrimaryButton } from './buttons/PrimaryButton'
export { SecondaryButton } from './buttons/SecondaryButton'
export { TryOnButton } from './buttons/TryOnButton'

// Indicators
export { Spinner } from './indicators/Spinner/Spinner'
export { CountDown } from './indicators/CountDown/CountDown'

// Popups
export { BottomSheet } from './popups/BottomSheet'
export { ErrorSnackbar } from './popups/ErrorSnackbar'
export { SelectionSnackbar } from './popups/SelectionSnackbar'

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
export { ShareModal } from './features/results/ShareModal'

// ===== ALERTS =====
export { AbortAlert } from './alerts/AbortAlert'
export { ConfirmationAlert } from './alerts/ConfirmationAlert'
