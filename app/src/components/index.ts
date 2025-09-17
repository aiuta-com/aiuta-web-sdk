import { Layout } from './layout/layout'
import { Section } from './Section'
import { Sdk } from './sdk/sdk'
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
import { ThumbnailItem } from './ThumbnailItem'

import { QrCode } from './qrCode/qrCode'
import { BottomSheet } from './BottomSheet'
import { UploadHistorySheet } from './UploadHistorySheet'
import { CountDown } from './CountDown/CountDown'

import { FullScreenImageModal } from './fullScreenImageModal/fullScreenImageModal'
import { ShareModal } from './shareModal/shareModal'
import { AbortAlert } from './AbortAlert'

import { Onboarding } from './onboarding/onboarding'
import { DesktopResultActions } from './DesktopResultActions'
import { RemoveHistoryBanner } from './removeHistoryBanner/removeHistoryBanner'
import { SelectionSnackbar } from './SelectionSnackbar'
import { ImageManager } from './ImageManager'

export { ImageGallery, EmptyGalleryState, SelectionBanner } from './imageGallery'
export { ResultsSlider, ShareButton } from './resultsGallery'

// Modals
export { AiutaModal, HistoryImagesRemoveModal } from './modals'
export type { ModalType }

export {
  // Core layout
  Layout,
  Section,
  ModalRenderer,
  AppRouter,
  Sdk,
  PageBar,
  PoweredBy,

  // UI Components
  ErrorSnackbar,
  Spinner,
  TryOnButton,
  PrimaryButton,
  SecondaryButton,
  CheckboxLabel,

  // Image Components
  TryOnAnimator,
  ProcessingStatus,
  SelectableImage,
  DeletableImage,
  MobileUploadPrompt,
  ThumbnailItem,

  // Specialized Components
  QrCode,
  BottomSheet,
  UploadHistorySheet,
  CountDown,

  // Modals and Overlays
  FullScreenImageModal,
  ShareModal,
  AbortAlert,

  // Feature Components
  Onboarding,
  DesktopResultActions,
  RemoveHistoryBanner,
  SelectionSnackbar,
  ImageManager,
}
