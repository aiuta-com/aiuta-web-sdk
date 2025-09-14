import { Layout } from './layout/layout'
import { Section } from './section/section'
import { Sdk } from './sdk/sdk'
import { ModalRenderer, type ModalType } from './ModalRenderer'
import { AppRouter } from './AppRouter'
import { SdkHeader } from './sdkHeader/sdkHeader'
import { SdkFooter } from './sdkFooter/sdkFooter'

import { ErrorSnackbar } from './ErrorSnackbar'
import { Spinner } from './spinner/spinner'
import { TryOnButton } from './tryOnButton/tryOnButton'
import { SecondaryButton } from './secondaryButton/secondaryButton'
import { TitleDescription } from './titleDescription/titleDescription'
import { CheckboxLabel } from './checkboxLabel/checkboxLabel'

import { ViewImage } from './viewImage/viewImage'
import { SelectableImage } from './selectableImage/selectableImage'
import { EmptyViewImage } from './emptyViewImage/emptyViewImage'
import { MiniSliderItem } from './MiniSliderItem/miniSliderItem'

import { QrCode } from './qrCode/qrCode'
import { BottomSheet } from './BottomSheet'
import { UploadHistorySheet } from './UploadHistorySheet'
import { CountDownAnimation } from './CountDownAnimation/countDownAnimation'

import { FullScreenImageModal } from './fullScreenImageModal/fullScreenImageModal'
import { ShareModal } from './shareModal/shareModal'
import { AbortModal } from './AbortModal'

import { Onboarding } from './onboarding/onboarding'
import { GeneratedImageButtons } from './generatedImageButtons/generatedImageButtons'
import { RemoveHistoryBanner } from './removeHistoryBanner/removeHistoryBanner'
import { ImageManager } from './ImageManager'

export { QrSpinner } from './animationIcons'
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
  EmptyViewImage,
  MiniSliderItem,

  // Specialized Components
  QrCode,
  BottomSheet,
  UploadHistorySheet,
  CountDownAnimation,

  // Modals and Overlays
  FullScreenImageModal,
  ShareModal,
  AbortModal,

  // Feature Components
  Onboarding,
  GeneratedImageButtons,
  RemoveHistoryBanner,
  ImageManager,
}
