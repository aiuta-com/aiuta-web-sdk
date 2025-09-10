import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { motion, easeInOut } from 'framer-motion'

// redux
import { useAppSelector, useAppDispatch } from '../../../lib/redux/store'

// actions
import { alertSlice } from '@lib/redux/slices/alertSlice'
import { generateSlice } from '../../../lib/redux/slices/generateSlice'

// selectors
import { isMobileSelector } from '@lib/redux/slices/configSlice/selectors'
import { uploadedViewFileSelector } from '@lib/redux/slices/fileSlice/selectors'

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

// rpc
import { useRpcProxy } from '@/contexts'
import { EndpointDataTypes } from '@/types'
import {
  recentlyPhotosSelector,
  isStartGenerationSelector,
} from '../../../lib/redux/slices/generateSlice/selectors'

// components
import { Alert, Section, ViewImage, TryOnButton, SecondaryButton } from '@/components/feature'
import ViewMobile from './viewMobile'
import { AiutaModal } from '@/components/shared/modals'

// types

// styles
import styles from './view.module.scss'

let generationApiCallInterval: NodeJS.Timeout | null = null

const initiallAnimationConfig = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
  transition: {
    duration: 0.3,
    ease: easeInOut,
  },
}

let startTryOnDuration = 0

export default function View() {
  const rpc = useRpcProxy()

  const navigate = useNavigate()

  const dispatch = useAppDispatch()

  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [isOpenAbortedModal, setIsOpenAbortedModal] = useState(false)
  const [recentlyPhoto, setRecentlyPhoto] = useState({ id: '', url: '' })
  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(null)

  const isMobile = useAppSelector(isMobileSelector)
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector)
  const uploadedViewFile = useAppSelector(uploadedViewFileSelector)
  const isStartGeneration = useAppSelector(isStartGenerationSelector)

  const handleNavigate = (path: string) => {
    navigate(`/${path}`)
  }

  const handlePutRecentlyPhotos = (id: string, url: string, storageKey: string) => {
    const uploadedPhotos = JSON.parse(localStorage.getItem(storageKey) || '[]')

    const newUploadedPhoto = { id, url }
    const newPhotos = [newUploadedPhoto, ...uploadedPhotos]

    dispatch(generateSlice.actions.setRecentlyPhotos(newPhotos))
    localStorage.setItem(storageKey, JSON.stringify(newPhotos))
  }

  const handleTryOnFinishedAnalytic = () => {
    const analytic = {
      data: {
        type: 'tryOn',
        event: 'tryOnFinished',
        pageId: 'loading',
        productIds: [endpointData?.skuId],
        tryOnDuration: Math.floor((Date.now() - startTryOnDuration) / 1000),
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  const handleGetGeneratedImage = async (operation_id: string) => {
    try {
      const response = await fetch('https://web-sdk.aiuta.com/api/sku-image-operation', {
        method: 'POST',
        body: JSON.stringify({ ...endpointData, operation_id: operation_id }),
      })

      if (!response.ok) return

      const result = await response.json()

      if (result.status === 'SUCCESS') {
        const { generated_images } = result
        const { id, url } = generated_images[0]

        setGeneratedImageUrl(url)
        handleNavigate('generated')
        setTimeout(() => {
          dispatch(generateSlice.actions.setIsStartGeneration(false))
        }, 500)

        handleTryOnFinishedAnalytic()

        dispatch(generateSlice.actions.setGeneratedImage({ id, url }))
        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval)
          generationApiCallInterval = null
        }
      } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval)
          generationApiCallInterval = null
        }

        dispatch(generateSlice.actions.setIsStartGeneration(false))
        dispatch(
          alertSlice.actions.setShowAlert({
            type: 'error',
            isShow: true,
            buttonText: 'Try again',
            content: 'Something went wrong. Please try again',
          }),
        )

        const analytic = {
          data: {
            type: 'tryOn',
            event: 'tryOnError',
            pageId: 'loading',
            errorType: result.status,
            errorMessage: result.error,
            productIds: [endpointData?.skuId],
          },
        }

        rpc.sdk.trackEvent(analytic)
      } else if (result.status === 'ABORTED') {
        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval)
          generationApiCallInterval = null
        }

        dispatch(generateSlice.actions.setIsStartGeneration(false))
        setIsOpenAbortedModal(true)

        const analytic = {
          data: {
            type: 'tryOn',
            event: 'tryOnAborted',
            abortReason: result.error,
            pageId: 'result',
            productIds: [endpointData?.skuId],
          },
        }

        rpc.sdk.trackEvent(analytic)
      }
    } catch (err) {
      console.error('Generation image Error:', err)
    }
  }

  const handleGenerate = async (event: any) => {
    if (
      event.data.data &&
      event.data.data.status === 200 &&
      event.data.data.type === MESSAGE_ACTIONS.JWT_TOKEN
    ) {
      const isExistUploadedPhoto = uploadedViewFile.id.length
      const uploaded_image_id = isExistUploadedPhoto ? uploadedViewFile.id : recentlyPhoto.id

      if (typeof event.data.data.jwtToken === 'string' && event.data.data.jwtToken.length > 0) {
        try {
          const operationResponse = await fetch(
            'https://web-sdk.aiuta.com/api/create-operation-id',
            {
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
              body: JSON.stringify({
                uploaded_image_id: uploaded_image_id,
                ...event.data.data,
              }),
            },
          )

          setEndpointData(event.data.data)

          if (operationResponse.ok) {
            const result = await operationResponse.json()

            dispatch(generateSlice.actions.setIsStartGeneration(true))

            if (isExistUploadedPhoto) {
              handlePutRecentlyPhotos(
                uploadedViewFile.id,
                uploadedViewFile.url,
                'tryon-recent-photos',
              )
            }

            if (result.operation_id) {
              generationApiCallInterval = setInterval(() => {
                handleGetGeneratedImage(result.operation_id)
                window.removeEventListener('message', handleGenerate)
              }, 3000)
            }
          } else {
            window.removeEventListener('message', handleGenerate)
            dispatch(generateSlice.actions.setIsStartGeneration(false))
            dispatch(
              alertSlice.actions.setShowAlert({
                type: 'error',
                isShow: true,
                buttonText: 'Try again',
                content: 'Something went wrong, please try again later.',
              }),
            )

            const data = await operationResponse.json()

            if (data && 'error' in data && typeof data.error === 'string') {
              const errorMessage = JSON.parse(data.error)

              const hadDetailInErrorMessage = 'detail' in errorMessage
              const hadMessageInErrorMessage = 'message' in errorMessage

              if (hadDetailInErrorMessage) {
                const analytic = {
                  data: {
                    type: 'tryOn',
                    event: 'tryOnError',
                    pageId: 'loading',
                    errorType: errorMessage.detail,
                    errorMessage: errorMessage.detail,
                    productIds: [endpointData?.skuId],
                  },
                }

                rpc.sdk.trackEvent(analytic)
              } else if (hadMessageInErrorMessage) {
                const analytic = {
                  data: {
                    type: 'tryOn',
                    event: 'tryOnError',
                    pageId: 'loading',
                    errorType: errorMessage.message,
                    errorMessage: JSON.stringify(errorMessage),
                    productIds: [endpointData?.skuId],
                  },
                }

                rpc.sdk.trackEvent(analytic)
              }
            }
          }
        } catch (error: any) {
          const analytic = {
            data: {
              type: 'tryOn',
              event: 'tryOnError',
              pageId: 'loading',
              errorType: 'requestOperationFailed',
              errorMessage: JSON.stringify(error.message),
              productIds: [endpointData?.skuId],
            },
          }

          rpc.sdk.trackEvent(analytic)
        }
      } else {
        window.removeEventListener('message', handleGenerate)
        dispatch(generateSlice.actions.setIsStartGeneration(false))
        dispatch(
          alertSlice.actions.setShowAlert({
            type: 'error',
            isShow: true,
            buttonText: 'Try again',
            content: 'Something went wrong, please try again later.',
          }),
        )

        const analytic = {
          data: {
            type: 'tryOn',
            event: 'tryOnError',
            pageId: 'loading',
            errorType: 'authorizationFailed',
            errorMessage: 'authorizationFailed',
            productIds: [endpointData?.skuId],
          },
        }

        rpc.sdk.trackEvent(analytic)
      }
    }
  }

  const handleTryOnStartedAnalytic = () => {
    const analytic = {
      data: {
        type: 'tryOn',
        event: 'tryOnStarted',
        pageId: 'loading',
        productIds: [endpointData?.skuId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  const handleTryOn = async () => {
    if (!endpointData) return console.error('Endpoints info is missing')

    const analytic = {
      data: {
        type: 'tryOn',
        event: 'initiated',
        pageId: 'imagePicker',
        productIds: [endpointData?.skuId],
      },
    }

    const analyticLoading = {
      data: {
        type: 'page',
        pageId: 'loading',
        productIds: [endpointData?.skuId],
      },
    }

    rpc.sdk.trackEvent(analytic)

    rpc.sdk.trackEvent(analyticLoading)

    handleTryOnStartedAnalytic()

    startTryOnDuration = Date.now()

    dispatch(alertSlice.actions.setShowAlert({ isShow: false }))
    dispatch(generateSlice.actions.setIsStartGeneration(true))

    if (endpointData.userId && endpointData.userId.length > 0) {
      const isExistUploadedPhoto = uploadedViewFile.id.length
      const uploaded_image_id = isExistUploadedPhoto ? uploadedViewFile.id : recentlyPhoto.id

      SecureMessenger.sendToParent({
        action: MESSAGE_ACTIONS.GET_AIUTA_JWT_TOKEN,
        uploaded_image_id: uploaded_image_id,
      })

      window.addEventListener('message', handleGenerate)
    } else {
      const isExistUploadedPhoto = uploadedViewFile.id.length
      const uploaded_image_id = isExistUploadedPhoto ? uploadedViewFile.id : recentlyPhoto.id

      try {
        const operationResponse = await fetch('https://web-sdk.aiuta.com/api/create-operation-id', {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            uploaded_image_id: uploaded_image_id,
            ...endpointData,
          }),
        })

        if (operationResponse.ok) {
          const result = await operationResponse.json()

          if (isExistUploadedPhoto) {
            handlePutRecentlyPhotos(
              uploadedViewFile.id,
              uploadedViewFile.url,
              'tryon-recent-photos',
            )
          }

          if (result.operation_id) {
            generationApiCallInterval = setInterval(() => {
              handleGetGeneratedImage(result.operation_id)
            }, 3000)
          }
        } else {
          dispatch(generateSlice.actions.setIsStartGeneration(false))
          dispatch(
            alertSlice.actions.setShowAlert({
              type: 'error',
              isShow: true,
              buttonText: 'Try again',
              content: 'Something went wrong, please try again later.',
            }),
          )

          const data = await operationResponse.json()

          if (data && 'error' in data && typeof data.error === 'string') {
            const errorMessage = JSON.parse(data.error)

            const hadDetailInErrorMessage = 'detail' in errorMessage
            const hadMessageInErrorMessage = 'message' in errorMessage

            if (hadDetailInErrorMessage) {
              const analytic = {
                data: {
                  type: 'tryOn',
                  event: 'tryOnError',
                  pageId: 'loading',
                  errorType: errorMessage.detail,
                  errorMessage: errorMessage.detail,
                  productIds: [endpointData?.skuId],
                },
              }

              rpc.sdk.trackEvent(analytic)
            } else if (hadMessageInErrorMessage) {
              const analytic = {
                data: {
                  type: 'tryOn',
                  event: 'tryOnError',
                  pageId: 'loading',
                  errorType: errorMessage.message,
                  errorMessage: JSON.stringify(errorMessage),
                  productIds: [endpointData?.skuId],
                },
              }

              rpc.sdk.trackEvent(analytic)
            }
          }
        }
      } catch (error: any) {
        const analytic = {
          data: {
            type: 'tryOn',
            event: 'tryOnError',
            pageId: 'loading',
            errorType: 'requestOperationFailed',
            errorMessage: JSON.stringify(error.message),
            productIds: [endpointData?.skuId],
          },
        }

        rpc.sdk.trackEvent(analytic)
      }
    }
  }

  const handleRegenerate = () => {
    dispatch(alertSlice.actions.setShowAlert({ isShow: false }))
    handleTryOn()
  }

  const handleCloseAbortedMidal = () => {
    setIsOpenAbortedModal(false)
  }

  const handleShowFullScreen = (activeImage: { id: string; url: string }) => {
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
      images: [],
      modalType: undefined,
      activeImage: activeImage,
    })
  }

  const handleGetWidnwInitiallySizes = () => {
    SecureMessenger.sendToParent({ action: MESSAGE_ACTIONS.GET_AIUTA_API_KEYS })
  }

  const isExistUploadedPhoto = uploadedViewFile.localUrl.length > 0
  const isCheckRecentlyPhotos = recentlyPhotos && recentlyPhotos.length > 0

  useEffect(() => {
    if (!isExistUploadedPhoto && isCheckRecentlyPhotos) {
      setRecentlyPhoto(recentlyPhotos[0])
    }
  }, [recentlyPhotos, uploadedViewFile])

  useEffect(() => {
    handleGetWidnwInitiallySizes()

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action) {
        if (event.data.data.status === 200 && event.data.action === MESSAGE_ACTIONS.BASE_KEYS) {
          setEndpointData(event.data.data)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div>
      <AiutaModal isOpen={isOpenAbortedModal}>
        <div className={styles.abortedModal}>
          <p>We couldn't detect anyone in this photo</p>
          <SecondaryButton
            text="Change photo"
            onClick={handleCloseAbortedMidal}
            classNames={styles.abortedButton}
          />
        </div>
      </AiutaModal>
      <Alert onClick={handleRegenerate} />
      {isMobile ? (
        <ViewMobile />
      ) : (
        <Section>
          <motion.div key="view-page" className={styles.viewContainer} {...initiallAnimationConfig}>
            <div className={styles.viewContent}>
              {isExistUploadedPhoto ? (
                <ViewImage
                  url={uploadedViewFile.localUrl}
                  isStartGeneration={isStartGeneration}
                  generatedImageUrl={generatedImageUrl}
                  isShowChangeImageBtn={
                    isOpenAbortedModal ? false : isStartGeneration ? false : true
                  }
                  onClick={() =>
                    handleShowFullScreen({
                      id: uploadedViewFile.id,
                      url: uploadedViewFile.url,
                    })
                  }
                />
              ) : null}
              {recentlyPhoto.url.length ? (
                <ViewImage
                  url={recentlyPhoto.url}
                  isStartGeneration={isStartGeneration}
                  generatedImageUrl={generatedImageUrl}
                  isShowChangeImageBtn={
                    isOpenAbortedModal ? false : isStartGeneration ? false : true
                  }
                  onClick={() => handleShowFullScreen(recentlyPhoto)}
                />
              ) : null}
            </div>
            {!isStartGeneration && !isOpenAbortedModal && (
              <TryOnButton isShowTryOnIcon onClick={handleTryOn}>
                Try On
              </TryOnButton>
            )}
          </motion.div>
        </Section>
      )}
    </div>
  )
}
