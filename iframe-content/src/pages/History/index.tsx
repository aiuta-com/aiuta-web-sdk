import React, { useEffect } from 'react'
import { motion, easeInOut } from 'framer-motion'

// redux
import { useAppSelector, useAppDispatch } from '../../../lib/redux/store'

// actions
import { fileSlice } from '@lib/redux/slices/fileSlice'
import { modalSlice } from '@lib/redux/slices/modalSlice'
import { generateSlice } from '@lib/redux/slices/generateSlice'

// selectors
import {
  selectedImagesSelector,
  generatedImagesSelector,
} from '@lib/redux/slices/generateSlice/selectors'
import {
  isMobileSelector,
  aiutaEndpointDataSelector,
  stylesConfigurationSelector,
  isSelectHistoryImagesSelector,
} from '@lib/redux/slices/configSlice/selectors'

// components
import { Section } from '@/components/feature'
import { SelectableImage } from '@/components/feature'
import { RemoveHistoryBanner } from '@/components/shared'

// components modal
import { HistoryImagesRemoveModal } from '@/components/shared/modals'

// types
import { AnalyticEventsEnum } from '@/types'

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

// styles
import styles from './history.module.scss'

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

// Removed unused sentAnalyticCount variable

export default function History() {
  const dispatch = useAppDispatch()

  const isMobile = useAppSelector(isMobileSelector)
  const selectedImages = useAppSelector(selectedImagesSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector)
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector)
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector)

  const handleShowFullScreen = (activeImage: { id: string; url: string }) => {
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
      images: generatedImages,
      modalType: 'history',
      activeImage: activeImage,
    })
  }

  const handleSelectImage = (id: string, url: string) => {
    if (!isMobile) {
      if (isSelectHistoryImages) {
        dispatch(generateSlice.actions.setSelectedImage(id))
      } else {
        handleShowFullScreen({ id, url })
      }
    } else {
      if (isSelectHistoryImages) {
        dispatch(generateSlice.actions.setSelectedImage(id))
      } else {
        dispatch(fileSlice.actions.setFullScreenImageUrl(url))
      }
    }
  }

  const handleCloseHistoryImagesModal = () => {
    dispatch(modalSlice.actions.setShowHistoryImagesModal(false))
  }

  const handleDeleteSelectedImages = () => {
    const deletedHistoryImages = generatedImages.filter(({ id }) => !selectedImages.includes(id))

    dispatch(generateSlice.actions.setSelectedImage([])) // Use for close history banner
    dispatch(generateSlice.actions.setGeneratedImage(deletedHistoryImages))

    handleCloseHistoryImagesModal() // Use for close history images model

    const analytic = {
      data: {
        type: 'history',
        event: 'generatedImageDeleted',
        pageId: 'history',
        productIds: [aiutaEndpointData.skuId],
      },
    }

    SecureMessenger.sendToParent({ action: AnalyticEventsEnum.generatedImageDeleted, analytic })
  }

  const onboardingAnalytic = () => {
    if (aiutaEndpointData.skuId && aiutaEndpointData.skuId.length > 0) {
      const analytic = {
        data: {
          type: 'page',
          pageId: 'history',
          productIds: [aiutaEndpointData.skuId],
        },
      }

      SecureMessenger.sendToParent({ action: AnalyticEventsEnum.history, analytic })
    }
  }

  useEffect(() => {
    onboardingAnalytic()
  }, [aiutaEndpointData])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action) {
        if (event.data.action === MESSAGE_ACTIONS.REMOVE_HISTORY_IMAGES) {
          dispatch(generateSlice.actions.setGeneratedImage(event.data.data.images))

          const analytic = {
            data: {
              type: 'history',
              event: 'generatedImageDeleted',
              pageId: 'history',
              productIds: [aiutaEndpointData.skuId],
            },
          }

          SecureMessenger.sendToParent({
            action: AnalyticEventsEnum.generatedImageDeleted,
            analytic,
          })
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const hasSelectedImages = selectedImages.length > 0

  const EmptyPage = () => {
    return (
      <div className={styles.emptyContent}>
        <img src={'./icons/emptyhistory.svg'} alt="Empty icon" />
        <p>Once you try on first item your try-on history would be stored here</p>
      </div>
    )
  }

  return (
    <>
      <Section className={`${styles.sectionContent} ${stylesConfiguration.pages.historyClassName}`}>
        <>
          <motion.div
            key="history-page"
            className={styles.viewContent}
            {...initiallAnimationConfig}
          >
            {generatedImages.length > 0 ? (
              <>
                <div
                  className={`${styles.imageContent} ${isMobile ? styles.imageContentMobile : ''}`}
                >
                  {generatedImages.map(({ id, url }) => (
                    <SelectableImage
                      key={id}
                      src={url}
                      imageId={id}
                      variant="history"
                      classNames={isMobile ? styles.selectableImageMobile : ''}
                      onClick={() => handleSelectImage(id, url)}
                    />
                  ))}
                </div>

                <HistoryImagesRemoveModal
                  onClickRightButton={handleDeleteSelectedImages}
                  onClickLeftButton={handleCloseHistoryImagesModal}
                />
              </>
            ) : (
              <EmptyPage />
            )}
          </motion.div>
          <div
            className={`${styles.historyBanner} ${
              hasSelectedImages && isMobile
                ? styles.activeHistoryBannerMobile
                : hasSelectedImages
                  ? styles.activeHistoryBanner
                  : ''
            }`}
          >
            <RemoveHistoryBanner />
          </div>
        </>
      </Section>
    </>
  )
}
