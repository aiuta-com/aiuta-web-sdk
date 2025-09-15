import { Layout } from './layout/layout'
import { Section } from './section/section'
import { Sdk } from './sdk/sdk'
import { ModalRenderer, type ModalType } from './ModalRenderer'
import { AppRouter } from './AppRouter'
import { SdkHeader } from './sdkHeader/sdkHeader'
import { SdkFooter } from './sdkFooter/sdkFooter'

import { ErrorSnackbar } from './ErrorSnackbar'
import { Spinner } from './Spinner/Spinner'
import { TryOnButton } from './tryOnButton/tryOnButton'
import { SecondaryButton } from './secondaryButton/secondaryButton'
import { TitleDescription } from './titleDescription/titleDescription'
import { CheckboxLabel } from './CheckboxLabel'

import { ViewImage } from './viewImage/viewImage'
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
  SdkHeader,
  SdkFooter,

  // UI Components
  ErrorSnackbar,
  Spinner,
  TryOnButton,
  SecondaryButton,
  TitleDescription,
  CheckboxLabel,

  // Image Components
  ViewImage,
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
  ImageManager,
}
