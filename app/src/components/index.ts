import { Section } from './Section'
import { ModalRenderer, type ModalType } from './ModalRenderer'
import { AppRouter } from './AppRouter'
import { PageBar } from './PageBar'
import { PoweredBy } from './PoweredBy'

import { ErrorSnackbar } from './ErrorSnackbar'
import { Spinner } from './Spinner/Spinner'
import { TryOnButton } from './TryOnButton/TryOnButton'
import { PrimaryButton } from './PrimaryButton'
import { SecondaryButton } from './SecondaryButton'
import { CheckboxLabel } from './CheckboxLabel'

// ViewImage component removed - replaced with TryOnAnimator and ProcessingStatus"
import { TryOnAnimator } from './TryOnAnimator'
import { ProcessingStatus } from './ProcessingStatus'
import { SelectableImage } from './SelectableImage'
import { DeletableImage } from './DeletableImage'
import { MobileUploadPrompt } from './MobileUploadPrompt'
import { ThumbnailList } from './ThumbnailList'

import { QrCode } from './QrCode'
import { BottomSheet } from './BottomSheet'
import { UploadHistorySheet } from './UploadHistorySheet'
import { CountDown } from './CountDown/CountDown'

import { FullScreenGallery } from './FullScreenGallery'
import { ShareModal } from './ShareModal'
import { AbortAlert } from './AbortAlert'

import { DesktopResultActions } from './DesktopResultActions'
import { SelectionSnackbar } from './SelectionSnackbar'
import { ImageManager } from './ImageManager'

export { ImageGallery, EmptyGalleryState } from './ImageGallery'

// Modals
import { ConfirmationAlert } from './ConfirmationAlert'
import { Consent } from './Consent'
import { OnboardingStep } from './OnboardingStep'
import { OnboardingCarousel } from './OnboardingCarousel'
export type { ModalType }

export {
  // Core layout
  Section,
  ModalRenderer,
  AppRouter,
  PageBar,
  PoweredBy,

  // UI Components
  ErrorSnackbar,
  Spinner,
  TryOnButton,
  PrimaryButton,
  SecondaryButton,
  CheckboxLabel,
  Consent,
  OnboardingStep,
  OnboardingCarousel,

  // Image Components
  TryOnAnimator,
  ProcessingStatus,
  SelectableImage,
  DeletableImage,
  MobileUploadPrompt,
  ThumbnailList,

  // Specialized Components
  QrCode,
  BottomSheet,
  UploadHistorySheet,
  CountDown,

  // Modals and Overlays
  FullScreenGallery,
  ShareModal,
  AbortAlert,
  ConfirmationAlert,

  // Feature Components
  DesktopResultActions,
  SelectionSnackbar,
  ImageManager,
}
