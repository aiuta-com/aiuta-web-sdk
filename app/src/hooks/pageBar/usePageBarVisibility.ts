import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { qrTokenSelector } from '@/store/slices/qrSlice'
import { isMobileSelector } from '@/store/slices/appSlice'
import { onboardingIsCompletedSelector } from '@/store/slices/onboardingSlice'
import { generatedImagesSelector } from '@/store/slices/generationsSlice/selectors'
import { inputImagesSelector } from '@/store/slices/uploadsSlice/selectors'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { uploadsIsSelectingSelector } from '@/store/slices/uploadsSlice'

export const usePageBarVisibility = () => {
  const location = useLocation()
  const pathName = location.pathname

  const qrToken = useAppSelector(qrTokenSelector)
  const isMobile = useAppSelector(isMobileSelector)
  const isOnboardingCompleted = useAppSelector(onboardingIsCompletedSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const recentlyPhotos = useAppSelector(inputImagesSelector)
  const isSelectingGenerations = useAppSelector(generationsIsSelectingSelector)
  const isSelectingUploads = useAppSelector(uploadsIsSelectingSelector)

  // Path checks
  const isOnBackButtonPage =
    pathName === '/generations' || pathName === '/uploads' || pathName === '/models'
  const isOnHistoryPage = pathName === '/generations' || pathName === '/uploads'
  const isOnQrTokenPage = qrToken ? pathName.includes(qrToken) : false
  const isOnOnboardingPage = pathName === '/onboarding'

  // Data availability
  const hasGeneratedImages = generatedImages.length > 0
  const hasRecentPhotos = recentlyPhotos.length > 0
  const hasAnyHistory = hasGeneratedImages || hasRecentPhotos

  // Selection states
  const isAnySelectionActive = isSelectingGenerations || isSelectingUploads

  // Navigation buttons logic (simplified)
  // 1. Back button: always show on /generations, /uploads, /models
  const showBackButton = isOnBackButtonPage && !isOnQrTokenPage

  // 2. History button: show only if NOT showing back button, NOT on onboarding, and have images
  const showHistoryButton = !showBackButton && !isOnOnboardingPage && hasGeneratedImages

  // Title visibility: always on desktop, on mobile only after onboarding
  const showTitle = !isMobile || isOnboardingCompleted

  // Right side content visibility
  const showSelectButton = isOnHistoryPage && hasAnyHistory
  const showCloseButton = !isOnQrTokenPage

  return {
    // Navigation buttons
    showHistoryButton,
    showBackButton,

    // Title
    showTitle,

    // Right side content
    showSelectButton,
    showCloseButton,

    // States
    isSelectionActive: isAnySelectionActive,
    isMobile,
  }
}
