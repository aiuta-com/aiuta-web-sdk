import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { qrTokenSelector } from '@/store/slices/qrSlice'
import { isMobileSelector } from '@/store/slices/appSlice'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'
import { sizeFitOriginSelector } from '@/store/slices/sizeFitSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { uploadsIsSelectingSelector } from '@/store/slices/uploadsSlice'
import { useGenerationsData, useUploadsData } from '@/hooks/data'
import { useSizeFitSteps } from '@/hooks/sizeFit'

export const usePageBarVisibility = () => {
  const location = useLocation()
  const pathName = location.pathname

  const qrToken = useAppSelector(qrTokenSelector)
  const isMobile = useAppSelector(isMobileSelector)
  const mode = useAppSelector(tryOnModeSelector)
  const { data: generatedImages = [] } = useGenerationsData()
  const { data: recentlyPhotos = [] } = useUploadsData()
  const isSelectingGenerations = useAppSelector(generationsIsSelectingSelector)
  const isSelectingUploads = useAppSelector(uploadsIsSelectingSelector)

  // Path checks
  const isOnHomePage = pathName === '/'
  const isOnBackButtonPage =
    pathName === '/generations' || pathName === '/uploads' || pathName === '/models'
  const isOnHistoryPage = pathName === '/generations' || pathName === '/uploads'
  const isOnQrTokenPage = qrToken ? pathName.includes(qrToken) : false
  const isOnOnboardingPage = pathName === '/onboarding'
  const isOnModelsPage = pathName === '/models'
  // The Size & Fit survey shows its step progress in the navbar center
  // (instead of a title); the results page has a regular title.
  const isOnSizeFitSurvey = pathName === '/size-fit'
  const isOnSizeFitResults = pathName === '/size-fit/results'
  const sizeFitOrigin = useAppSelector(sizeFitOriginSelector)
  const { stepIndex: sizeFitStepIndex } = useSizeFitSteps()
  // Back within the survey steps; the first step goes back only when the
  // flow was entered from the try-on results screen
  const showSizeFitBack =
    isOnSizeFitResults ||
    (isOnSizeFitSurvey && (sizeFitStepIndex > 0 || sizeFitOrigin === 'results'))
  // The QR prompt is both an entry screen (from onboarding) and an "Add new"
  // destination. Only the latter is routed with { canGoBack }, where the left
  // button must be a back arrow instead of the history icon.
  const isReturnableQrPage =
    pathName === '/qr' && !!(location.state as { canGoBack?: boolean } | null)?.canGoBack

  // Data availability
  const hasGeneratedImages = generatedImages.length > 0
  const hasRecentPhotos = recentlyPhotos.length > 0
  const hasAnyHistory = hasGeneratedImages || hasRecentPhotos

  // Selection states
  const isAnySelectionActive = isSelectingGenerations || isSelectingUploads

  // Navigation buttons logic (simplified)
  // 1. Back button: always show on /generations, /uploads, /models, and on the
  // QR prompt when it was reached via "Add new" (but not on home page)
  const showBackButton =
    ((isOnBackButtonPage || isReturnableQrPage) && !isOnQrTokenPage && !isOnHomePage) ||
    showSizeFitBack

  // 2. History button: show only if NOT showing back button, NOT on onboarding, NOT on home page, and have images
  const showHistoryButton =
    !showBackButton &&
    !isOnOnboardingPage &&
    !isOnHomePage &&
    !isOnSizeFitSurvey &&
    !isOnSizeFitResults &&
    hasGeneratedImages

  // Title visibility: the onboarding navbar has no title (close button only);
  // on mobile the general models page puts its Women/Men segmented control in
  // the navbar center instead of the title (see ModelsMobile). Shoes mode keeps
  // the title ("Select example") since its gender toggle lives in the content.
  const isShoes = mode === 'shoes'
  const showTitle =
    !isOnOnboardingPage && !isOnSizeFitSurvey && !(isOnModelsPage && isMobile && !isShoes)

  // Right side content visibility
  const showSelectButton = isOnHistoryPage && hasAnyHistory
  const showCloseButton = !isOnQrTokenPage

  return {
    // Navigation buttons
    showHistoryButton,
    showBackButton,

    // Title
    showTitle,
    // Size & Fit survey progress rendered in the title slot
    showSizeFitProgress: isOnSizeFitSurvey,

    // Right side content
    showSelectButton,
    showCloseButton,

    // States
    isSelectionActive: isAnySelectionActive,
    isMobile,
  }
}
