import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { useRpc } from '@/contexts'
import { useAppVisibility } from '@/hooks'
import { productIdsSelector, isGeneratingSelector } from '@/store/slices/tryOnSlice'
import { onboardingCurrentStepSelector } from '@/store/slices/onboardingSlice'
import { selectedImagesSelector } from '@/store/slices/generationsSlice/selectors'
import { inputImagesSelector } from '@/store/slices/uploadsSlice/selectors'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { uploadsIsSelectingSelector } from '@/store/slices/uploadsSlice'

export const usePageBarNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const { hideApp } = useAppVisibility()

  const pathName = location.pathname
  const productIds = useAppSelector(productIdsSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const onboardingSteps = useAppSelector(onboardingCurrentStepSelector)
  const recentlyPhotos = useAppSelector(inputImagesSelector)
  const selectedImages = useAppSelector(selectedImagesSelector)
  const isSelectingGenerations = useAppSelector(generationsIsSelectingSelector)
  const isSelectingUploads = useAppSelector(uploadsIsSelectingSelector)

  const trackAnalyticsEvent = (pageId: string, type: string = 'exit') => {
    const analytic = {
      type,
      pageId,
      productIds,
    }
    rpc.sdk.trackEvent(analytic)
  }

  const getAnalyticsPageId = (currentPath: string, currentStep?: number) => {
    if (currentPath === '/') {
      if (currentStep === 1) return 'bestResults'
      if (currentStep === 2) return 'consent'
      return 'howItWorks'
    }
    if (currentPath === '/qr') return 'qrPrompt'
    if (currentPath === '/results') return 'results'
    if (currentPath === '/generations') return 'history'
    if (currentPath === '/uploads') return 'imagePicker'
    if (currentPath === '/tryon') return 'imagePicker'
    return ''
  }

  const handleCloseModal = () => {
    if (typeof window === 'undefined') return

    // Track loading exit if generating
    if (isGenerating) {
      trackAnalyticsEvent('loading')
      hideApp()
      return
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
    const isOnHistoryPage = pathName === '/generations' || pathName === '/uploads'
    const isOnModelsPage = pathName === '/models'

    // Track exit from history page
    if (pathName === '/generations' && isOnHistoryPage) {
      trackAnalyticsEvent('history')
    }

    if (isOnHistoryPage || isOnModelsPage) {
      // Clear selections and navigate back
      if (recentlyPhotos.length === 0) {
        navigate(-1)
      } else if (selectedImages.length > 0) {
        dispatch(generationsSlice.actions.clearSelectedImages())
        dispatch(generationsSlice.actions.setIsSelecting(false))
        setTimeout(() => navigate(-1), 100)
      } else {
        navigate(-1)
      }
    } else {
      // Navigate to target history page
      navigate(`/${targetPath}`)
    }
  }

  const handleToggleSelection = () => {
    if (pathName === '/uploads') {
      dispatch(uploadsSlice.actions.setIsSelecting(!isSelectingUploads))
    } else if (pathName === '/generations') {
      dispatch(generationsSlice.actions.setIsSelecting(!isSelectingGenerations))
    }
  }

  return {
    handleCloseModal,
    handleHistoryNavigation,
    handleToggleSelection,
  }
}
