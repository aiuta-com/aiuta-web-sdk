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
  const isOnHistoryPage = pathName === '/generations-history' || pathName === '/uploads-history'
  const isOnQrTokenPage = qrToken ? pathName.includes(qrToken) : false

  // Data availability
  const hasGeneratedImages = generatedImages.length > 0
  const hasRecentPhotos = recentlyPhotos.length > 0
  const hasAnyHistory = hasGeneratedImages || hasRecentPhotos

  // Selection states
  const isAnySelectionActive = isSelectingGenerations || isSelectingUploads

  // Desktop visibility logic
  const showHistoryButtonDesktop = !isMobile && !isOnQrTokenPage && hasGeneratedImages
  const showBackButtonDesktop =
    !isMobile && !isOnQrTokenPage && isOnHistoryPage && !hasGeneratedImages

  // Mobile visibility logic
  const showHistoryButtonMobile = isMobile && hasGeneratedImages
  const showBackButtonMobile = isMobile && isOnHistoryPage
  const shouldShowMobileTitle = isMobile && isOnboardingCompleted

  // Title visibility
  const showTitle = !isMobile || shouldShowMobileTitle

  // Right side content visibility
  const showSelectButton = isOnHistoryPage && hasAnyHistory
  const showCloseButton = !isOnQrTokenPage

  return {
    // Navigation buttons
    showHistoryButton: showHistoryButtonDesktop || showHistoryButtonMobile,
    showBackButton: showBackButtonDesktop || showBackButtonMobile,

    // Title
    showTitle,

    // Right side content
    showSelectButton,
    showCloseButton,

    // States
    isOnHistoryPage,
    isOnQrTokenPage,
    isMobile,
    isSelectionActive: isAnySelectionActive,
    hasAnyHistory,
  }
}
