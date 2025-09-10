import React, { useState, useEffect, ChangeEvent } from 'react'
import { motion, easeInOut } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// redux
import { useAppSelector, useAppDispatch } from '@lib/redux/store'

// actions
import { fileSlice } from '@lib/redux/slices/fileSlice'
import { configSlice } from '@lib/redux/slices/configSlice'
import { generateSlice } from '@lib/redux/slices/generateSlice'

// selectors
import {
  aiutaEndpointDataSelector,
  isSelectPreviouselyImagesSelector,
} from '@lib/redux/slices/configSlice/selectors'
import { recentlyPhotosSelector } from '@lib/redux/slices/generateSlice/selectors'

// helpers
import { generateRandomString } from '@/helpers/generateRandomString'

// components
import { Section, TryOnButton, SelectableImage } from '@/components/feature'

// types

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

// rpc
import { useRpcProxy } from '@/contexts'
import { EndpointDataTypes } from '@/types'

// styles
import styles from './previously.module.scss'

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

export default function Previously() {
  const rpc = useRpcProxy()

  const navigate = useNavigate()

  const dispatch = useAppDispatch()

  const recentlyPhotos = useAppSelector(recentlyPhotosSelector)
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector)
  const isSelectPreviouselyImages = useAppSelector(isSelectPreviouselyImagesSelector)

  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(null)

  const handleNavigate = (path: string) => {
    if (!recentlyPhotos.length) return
    navigate(`/${path}`)
  }

  const handleChnagePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!endpointData) return
    dispatch(configSlice.actions.setIsShowSpinner(true))

    if (event.target && event.target.files) {
      const file = event.target.files[0]

      if (!file) return dispatch(configSlice.actions.setIsShowSpinner(false))

      const hasUserId = typeof endpointData.userId === 'string' && endpointData.userId.length > 0
      let headers: any = { 'Content-Type': file.type, 'X-Filename': file.name }

      if (hasUserId) {
        headers['userid'] = endpointData.userId
      } else {
        headers['keys'] = endpointData.apiKey
      }

      try {
        const uploadedResponse = await fetch('https://web-sdk.aiuta.com/api/upload-image', {
          method: 'POST',
          headers: headers,
          body: file,
        })

        if (uploadedResponse.ok) {
          const result = await uploadedResponse.json()

          if (result.owner_type === 'user') {
            dispatch(fileSlice.actions.setUploadViewFile({ file: file, ...result }))
          }
        }

        navigate('/view')
      } catch (error) {
        console.error('Upload image Error: ', error)
      } finally {
        dispatch(configSlice.actions.setIsShowSpinner(false))
      }
    }
  }

  const handleChooseNewPhoto = (id: string, url: string) => {
    if (isSelectPreviouselyImages) {
      dispatch(fileSlice.actions.setUploadViewFile({ id, url }))
      handleNavigate('view')

      const analytic = {
        data: {
          type: 'picker',
          pageId: 'pickerEvent',
          event: 'uploadedPhotoSelected',
          productIds: [aiutaEndpointData?.skuId],
        },
      }

      rpc.sdk.trackEvent(analytic)
    } else {
      handleShowFullScreen({ id, url })
    }

    dispatch(configSlice.actions.setIsSelectPreviouselyImages(false))
  }

  const handleRemovePhoto = (imageId: string) => {
    const removedPhoto = recentlyPhotos.filter(({ id }) => id !== imageId)

    dispatch(generateSlice.actions.setRecentlyPhotos(removedPhoto))

    const analytic = {
      data: {
        type: 'picker',
        pageId: 'imagePicker',
        event: 'uploadedPhotoDeleted',
        productIds: [aiutaEndpointData?.skuId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  const handleGetWidnwInitiallySizes = () => {
    SecureMessenger.sendToParent({ action: MESSAGE_ACTIONS.GET_AIUTA_API_KEYS })
  }

  const handleShowFullScreen = (activeImage: { id: string; url: string }) => {
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
      images: recentlyPhotos,
      modalType: 'previously',
      activeImage: activeImage,
    })
  }

  // Removed unused handleCheckQRUploadedPhoto function

  const handleAnalytic = () => {
    if (aiutaEndpointData.skuId && aiutaEndpointData.skuId.length > 0) {
      const analytic = {
        data: {
          type: 'picker',
          pageId: 'imagePicker',
          event: 'uploadsHistoryOpened',
          productIds: [aiutaEndpointData?.skuId],
        },
      }

      rpc.sdk.trackEvent(analytic)
    }
  }

  useEffect(() => {
    handleAnalytic()
  }, [])

  useEffect(() => {
    if (!recentlyPhotos.length) {
      dispatch(configSlice.actions.setQrToken(generateRandomString()))
    }
  }, [recentlyPhotos, dispatch])

  useEffect(() => {
    if (!recentlyPhotos.length) {
      //TO DO may used in future
      // qrApiInterval.current = setInterval(() => {
      //   handleCheckQRUploadedPhoto();
      // }, 3000);
      navigate('/qr')
    }

    //TO DO may used in future
    // return () => {
    //   if (qrApiInterval.current) {
    //     clearInterval(qrApiInterval.current);
    //   }
    // };
    // }, [qrApiInterval, recentlyPhotos, handleCheckQRUploadedPhoto]);
  }, [recentlyPhotos])

  useEffect(() => {
    handleGetWidnwInitiallySizes()

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action) {
        if (
          event.data.data &&
          event.data.data.status === 200 &&
          event.data.action === MESSAGE_ACTIONS.BASE_KEYS
        ) {
          setEndpointData(event.data.data)
        }

        if (event.data.action === MESSAGE_ACTIONS.REMOVE_PREVIOUSELY_IMAGES) {
          handleRemovePhoto(event.data.data.images.id)
          dispatch(generateSlice.actions.setRecentlyPhotos(event.data.data.images))
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <>
      <Section
        className={`${styles.sectionContent} `}
      >
        <motion.div
          key="previously-page"
          className={styles.viewContent}
          {...initiallAnimationConfig}
        >
          {recentlyPhotos.length > 0 ? (
            <div className={styles.imageContent}>
              {recentlyPhotos.map(({ id, url }) => (
                <SelectableImage
                  key={id}
                  src={url}
                  imageId={id}
                  variant="previously"
                  onClick={() => handleChooseNewPhoto(id, url)}
                  onDelete={handleRemovePhoto}
                />
              ))}
            </div>
          ) : //TO DO may used in future
          // <div className={styles.qrContent}>
          //   {endpointData ? (
          //     <QrCode onChange={() => {}} isShowQrInfo={false} url={qrUrl} />
          //   ) : null}
          // </div>
          null}

          <TryOnButton onClick={() => handleNavigate('qr')}>
            <>
              + Upload new photo
              {!recentlyPhotos.length && (
                <label className={styles.changeImageBtn}>
                  <input type="file" onChange={handleChnagePhoto} />
                </label>
              )}
            </>
          </TryOnButton>
        </motion.div>
      </Section>
    </>
  )
}
