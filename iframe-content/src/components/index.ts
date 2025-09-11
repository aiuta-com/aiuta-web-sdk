// Core layout and structure
import { Layout } from './layout/layout'
import { Section } from './section/section'
import { Sdk } from './sdk/sdk'
import { SdkHeader } from './sdkHeader/sdkHeader'
import { SdkFooter } from './sdkFooter/sdkFooter'

// UI Components
import { Alert } from './alert/alert'
import { Spinner } from './spinner/spinner'
import { TryOnButton } from './tryOnButton/tryOnButton'
import { SecondaryButton } from './secondaryButton/secondaryButton'
import { TitleDescription } from './titleDescription/titleDescription'
import { CheckboxLabel } from './checkboxLabel/checkboxLabel'

// Image Components
import { ViewImage } from './viewImage/viewImage'
import { SelectableImage } from './selectableImage/selectableImage'
import { EmptyViewImage } from './emptyViewImage/emptyViewImage'
import { MiniSliderItem } from './MiniSliderItem/miniSliderItem'

// Specialized Components
import { QrCode } from './qrCode/qrCode'
import { Swip } from './swip/swip'
import { CountDownAnimation } from './CountDownAnimation/countDownAnimation'

// Modals and Overlays
import { FullScreenImageModal } from './fullScreenImageModal/fullScreenImageModal'
import { ShareModal } from './shareModal/shareModal'
import { AbortModal } from './AbortModal'

// Feature Components
import { Onboarding } from './onboarding/onboarding'
import { GeneratedImageButtons } from './generatedImageButtons/generatedImageButtons'
import { RemoveHistoryBanner } from './removeHistoryBanner/removeHistoryBanner'
import { ImageManager } from './ImageManager'

// Animation Icons
export { QrSpinner } from './animationIcons'

// Galleries and Collections
export { ImageGallery, EmptyGalleryState, SelectionBanner } from './imageGallery'
export { ResultsSlider, ShareButton } from './resultsGallery'

// Modals
export { AiutaModal, HistoryImagesRemoveModal } from './modals'

// Main exports
export {
  // Core layout
  Layout,
  Section,
  Sdk,
  SdkHeader,
  SdkFooter,

  // UI Components
  Alert,
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
  Swip,
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
