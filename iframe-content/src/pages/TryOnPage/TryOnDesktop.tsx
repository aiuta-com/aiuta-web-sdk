import React, { useEffect, useState } from 'react'
import { motion, easeInOut } from 'framer-motion'

// redux
import { useAppSelector } from '@lib/redux/store'

// selectors
import { uploadedViewFileSelector } from '@lib/redux/slices/fileSlice/selectors'
import { isStartGenerationSelector } from '@lib/redux/slices/generateSlice/selectors'

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

// components
import { Alert, Section, TryOnButton } from '@/components/feature'
import { AbortModal, ImageManager } from '@/components/shared'

// hooks
import { useTryOnGeneration, usePhotoGallery } from '../../hooks'

// types
import { UploadedImage } from '../../utils/api/tryOnApiService'

// styles
import styles from './tryOn.module.scss'

const animationConfig = {
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

export default function TryOnDesktop() {
  const uploadedViewFile = useAppSelector(uploadedViewFileSelector)
  const isStartGeneration = useAppSelector(isStartGenerationSelector)

  const { getRecentPhoto } = usePhotoGallery()
  const { generatedImageUrl, isOpenAbortedModal, startTryOn, regenerate, closeAbortedModal } =
    useTryOnGeneration()

  const [recentImage, setRecentImage] = useState<UploadedImage | null>(null)

  const handleShowFullScreen = (activeImage: UploadedImage) => {
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
      images: [],
      modalType: undefined,
      activeImage: activeImage,
    })
  }

  const hasUploadedImage = uploadedViewFile.localUrl.length > 0
  const showTryOnButton = !isStartGeneration && !isOpenAbortedModal

  useEffect(() => {
    if (!hasUploadedImage) {
      const recent = getRecentPhoto()
      setRecentImage(recent)
    }
  }, [hasUploadedImage, getRecentPhoto])

  return (
    <>
      <AbortModal isOpen={isOpenAbortedModal} onClose={closeAbortedModal} />
      <Alert onClick={regenerate} />

      <Section>
        <motion.div key="tryon-desktop" className={styles.tryOnContainer} {...animationConfig}>
          <div className={styles.tryOnContent}>
            <ImageManager
              uploadedImage={hasUploadedImage ? uploadedViewFile : undefined}
              recentImage={recentImage || undefined}
              isStartGeneration={isStartGeneration}
              generatedImageUrl={generatedImageUrl}
              onImageClick={handleShowFullScreen}
              showFullScreenOnClick={true}
            />
          </div>
          {showTryOnButton && (hasUploadedImage || recentImage) && (
            <TryOnButton isShowTryOnIcon onClick={() => startTryOn()}>
              Try On
            </TryOnButton>
          )}
        </motion.div>
      </Section>
    </>
  )
}
