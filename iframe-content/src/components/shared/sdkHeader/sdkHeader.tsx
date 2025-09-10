import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// redux
import { useAppDispatch, useAppSelector } from '@lib/redux/store'

// actions
import { alertSlice } from '@lib/redux/slices/alertSlice'
import { configSlice } from '@lib/redux/slices/configSlice'
import { generateSlice } from '@lib/redux/slices/generateSlice'

// selectors
import {
  qrTokenSelector,
  isMobileSelector,
  onboardingStepsSelector,
  isOnboardingDoneSelector,
  aiutaEndpointDataSelector,
  isSelectHistoryImagesSelector,
  isSelectPreviouselyImagesSelector,
} from '@lib/redux/slices/configSlice/selectors'
import {
  selectedImagesSelector,
  recentlyPhotosSelector,
  generatedImagesSelector,
  isStartGenerationSelector,
} from '@lib/redux/slices/generateSlice/selectors'

// types

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'
import { useRpcProxy } from '../../../contexts'

// styles
import styles from './sdkHeader.module.scss'

export const SdkHeader = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpcProxy()

  const location = useLocation()

  const qrToken = useAppSelector(qrTokenSelector)
  const isMobile = useAppSelector(isMobileSelector)
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector)
  const selectedImages = useAppSelector(selectedImagesSelector)
  const onboardingSteps = useAppSelector(onboardingStepsSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const isOnboardingDone = useAppSelector(isOnboardingDoneSelector)
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector)
  const isStartGeneration = useAppSelector(isStartGenerationSelector)
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector)
  const isSelectPreviouselyImages = useAppSelector(isSelectPreviouselyImagesSelector)

  const [hasMounted, setHasMounted] = useState(false)
  const [headerText, setHeaderText] = useState('Virtual Try-On')

  const pathName = location.pathname
  const hasHistoryImages = generatedImages.length > 0
  const hasRecentlyPhotos = recentlyPhotos.length > 0
  const isCheckOnboardingForMobile = isMobile && isOnboardingDone
  const isCheckQrTokenPage = qrToken ? pathName.includes(qrToken) : false
  const iasNavigatePath = pathName === '/history' || pathName === '/previously'
  const iasNavigatePathMobile = pathName === '/history' || pathName === '/previously'

  const handleAnalytic = () => {
    const analytic = {
      data: {
        type: 'exit',
        pageId: 'howItWorks',
        productIds: [aiutaEndpointData?.skuId],
      },
    }

    if (pathName === '/') {
      if (onboardingSteps === 1) {
        analytic.data.pageId = 'bestResults'
      } else if (onboardingSteps === 2) {
        analytic.data.pageId = 'consent'
      }
    } else if (pathName === '/view') {
      return
    } else if (pathName === '/qr') {
      analytic.data.pageId = 'imagePicker'
    } else if (pathName === '/generated') {
      analytic.data.pageId = 'results'
    }

    SecureMessenger.sendAnalyticsEvent(analytic)
  }

  const handleCloseModal = () => {
    if (typeof window !== 'undefined') {
      const recentPhotosFromLocal = JSON.parse(localStorage.getItem('tryon-recent-photos') || '[]')

      if (isStartGeneration) {
        const analytic = {
          data: {
            type: 'exit',
            pageId: 'loading',
            productIds: [aiutaEndpointData?.skuId],
          },
        }

        SecureMessenger.sendAnalyticsEvent(analytic)

        rpc.sdk.closeModal()
        return
      }

      if (recentPhotosFromLocal.length > 0) {
        setTimeout(() => {
          navigate('/view')
        }, 500)
      }
      rpc.sdk.closeModal()
    }

    handleAnalytic()
    dispatch(alertSlice.actions.setShowAlert({ isShow: false }))
  }

  const handleToggleHistorySelectImages = () => {
    if (pathName === '/previously') {
      dispatch(configSlice.actions.setIsSelectPreviouselyImages(!isSelectPreviouselyImages))
    } else if (pathName === '/history') {
      dispatch(configSlice.actions.setIsSelectHistoryImages(!isSelectHistoryImages))
    }
  }

  const handleNavigate = (path: string) => {
    if (pathName === '/history' && iasNavigatePath) {
      const analytic = {
        data: {
          type: 'exit',
          pageId: 'history',
          productIds: [aiutaEndpointData?.skuId],
        },
      }

      SecureMessenger.sendAnalyticsEvent(analytic)
    }

    if (iasNavigatePath) {
      if (recentlyPhotos.length === 0) {
        navigate('/qr')
      } else if (selectedImages.length > 0) {
        dispatch(generateSlice.actions.setSelectedImage([]))
        setTimeout(() => {
          navigate(-1)
        }, 100)
      } else {
        if (isMobile) {
          if (!hasHistoryImages) {
            navigate('/view')
          } else {
            navigate(-1)
          }
        } else {
          if (generatedImages.length === 0) {
            navigate('/view')
          } else {
            navigate(-1)
          }
        }
      }
    } else {
      navigate(`/${path}`)
    }

    dispatch(configSlice.actions.setIsSelectHistoryImages(false))
    dispatch(configSlice.actions.setIsSelectPreviouselyImages(false))
  }

  useEffect(() => {
    if (pathName === '/history') {
      setHeaderText('History')
    } else if (pathName === '/previously') {
      setHeaderText('Previously used photos')
    } else {
      setHeaderText('Virtual Try-On')
    }
  }, [pathName])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action) {
        if (event.data.data?.status === 200 && event.data.action === MESSAGE_ACTIONS.BASE_KEYS) {
          dispatch(configSlice.actions.setAiutaEndpointData(event.data.data))
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [aiutaEndpointData])

  if (!hasMounted) return null

  return (
    <header
      className={`${styles.sdkHeader} ${
        isMobile ? styles.sdkHeaderMobile : ''
      } `}
    >
      {!isMobile && !isCheckQrTokenPage ? (
        hasHistoryImages ? (
          <img
            alt="History icon"
            src={iasNavigatePath ? './icons/back.svg' : './icons/history.svg'}
            onClick={() => handleNavigate('history')}
          />
        ) : iasNavigatePath ? (
          <img
            alt="History icon"
            src={'./icons/back.svg'}
            onClick={() => handleNavigate('history')}
          />
        ) : null
      ) : hasHistoryImages ? (
        <img
          alt="History icon"
          src={iasNavigatePath ? './icons/back.svg' : 'icons/history.svg'}
          onClick={() => handleNavigate('history')}
        />
      ) : iasNavigatePath ? (
        <img
          alt="History icon"
          src={'./icons/back.svg'}
          onClick={() => handleNavigate('history')}
        />
      ) : null}
      {!isMobile && (
        <div className={styles.titleBox}>
          <p className={styles.title}>{headerText}</p>
        </div>
      )}
      {isCheckOnboardingForMobile && (
        <div className={styles.titleBox}>
          <p className={styles.title}>{headerText}</p>
        </div>
      )}
      {iasNavigatePathMobile && (hasHistoryImages || hasRecentlyPhotos) ? (
        <p
          className={`${styles.historyText} ${
            isSelectHistoryImages || isSelectPreviouselyImages ? styles.historyTextUnactive : ''
          }`}
          onClick={handleToggleHistorySelectImages}
        >
          Select
        </p>
      ) : !isCheckQrTokenPage ? (
        <img alt="History icon" src={'./icons/close.svg'} onClick={handleCloseModal} />
      ) : null}
    </header>
  )
}
