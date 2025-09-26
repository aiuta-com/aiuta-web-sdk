import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { useRpc } from '@/contexts'
import { useAppVisibility } from '@/hooks'
import { productIdSelector, isGeneratingSelector } from '@/store/slices/tryOnSlice'
import { onboardingCurrentStepSelector } from '@/store/slices/onboardingSlice'
import {
  selectedImagesSelector,
  generatedImagesSelector,
} from '@/store/slices/generationsSlice/selectors'
import { inputImagesSelector } from '@/store/slices/uploadsSlice/selectors'
import { isMobileSelector } from '@/store/slices/appSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { uploadsIsSelectingSelector } from '@/store/slices/uploadsSlice'

export const usePageBarNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const { hideApp } = useAppVisibility()

  const pathName = location.pathname
  const productId = useAppSelector(productIdSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const onboardingSteps = useAppSelector(onboardingCurrentStepSelector)
  const recentlyPhotos = useAppSelector(inputImagesSelector)
  const selectedImages = useAppSelector(selectedImagesSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const isMobile = useAppSelector(isMobileSelector)
  const isSelectingGenerations = useAppSelector(generationsIsSelectingSelector)
  const isSelectingUploads = useAppSelector(uploadsIsSelectingSelector)

  const trackAnalyticsEvent = (pageId: string, type: string = 'exit') => {
    const analytic = {
      data: {
        type,
        pageId,
        productIds: [productId],
      },
    }
    rpc.sdk.trackEvent(analytic)
  }

  const getAnalyticsPageId = (currentPath: string, currentStep?: number) => {
    if (currentPath === '/') {
      if (currentStep === 1) return 'bestResults'
      if (currentStep === 2) return 'consent'
      return 'howItWorks'
    }
    if (currentPath === '/qr') return 'imagePicker'
    if (currentPath === '/generated') return 'results'
    if (currentPath === '/generations-history') return 'history'
    if (currentPath === '/view') return null // No analytics for view page
    return 'howItWorks'
  }

  const handleCloseModal = () => {
    if (typeof window === 'undefined') return

    const recentPhotosFromLocal = JSON.parse(localStorage.getItem('tryon-recent-photos') || '[]')

    // Track loading exit if generating
    if (isGenerating) {
      trackAnalyticsEvent('loading')
      hideApp()
      return
    }

    // Navigate to view if has recent photos
    if (recentPhotosFromLocal.length > 0) {
      setTimeout(() => {
        navigate('/view')
      }, 500)
    }

    // Track analytics and close
    const pageId = getAnalyticsPageId(pathName, onboardingSteps)
    if (pageId) {
      trackAnalyticsEvent(pageId)
    }

    hideApp()
    dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())
  }

  const handleHistoryNavigation = (targetPath: string) => {
    const isOnHistoryPage = pathName === '/generations-history' || pathName === '/uploads-history'

    // Track exit from history page
    if (pathName === '/generations-history' && isOnHistoryPage) {
      trackAnalyticsEvent('history')
    }

    if (isOnHistoryPage) {
      // Clear selections and navigate back
      if (recentlyPhotos.length === 0) {
        navigate('/qr')
      } else if (selectedImages.length > 0) {
        dispatch(generationsSlice.actions.clearSelectedImages())
        dispatch(generationsSlice.actions.setIsSelecting(false))
        setTimeout(() => navigate(-1), 100)
      } else {
        const shouldNavigateToView = isMobile
          ? !generatedImages.length
          : generatedImages.length === 0

        if (shouldNavigateToView) {
          navigate('/view')
        } else {
          navigate(-1)
        }
      }
    } else {
      // Navigate to target history page
      navigate(`/${targetPath}`)
    }
  }

  const handleToggleSelection = () => {
    if (pathName === '/uploads-history') {
      dispatch(uploadsSlice.actions.setIsSelecting(!isSelectingUploads))
    } else if (pathName === '/generations-history') {
      dispatch(generationsSlice.actions.setIsSelecting(!isSelectingGenerations))
    }
  }

  return {
    handleCloseModal,
    handleHistoryNavigation,
    handleToggleSelection,
    isOnHistoryPage: pathName === '/generations-history' || pathName === '/uploads-history',
    currentPath: pathName,
  }
}
