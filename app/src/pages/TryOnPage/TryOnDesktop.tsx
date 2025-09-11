import React, { useEffect, useState } from 'react'
import { motion, easeInOut } from 'framer-motion'

// redux
import { useAppSelector } from '@/store/store'

// selectors
import { uploadedViewFileSelector } from '@/store/slices/fileSlice/selectors'
import { isStartGenerationSelector } from '@/store/slices/generateSlice/selectors'

// messaging
// TODO: Replace with RPC - need to support opening fullscreen modal from iframe to SDK
// Required data: { images: UploadedImage[], modalType?: string }

// components
import { ErrorSnackbar, Section, TryOnButton } from '@/components'
import { AbortModal, ImageManager } from '@/components'

// hooks
import { useTryOnGeneration, usePhotoGallery } from '@/hooks'

// types
import { UploadedImage } from '@/utils/api/tryOnApiService'

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
    // TODO: Replace with RPC call to SDK
    // await rpc.sdk.openFullScreenModal({
    //   images: [],
    //   modalType: undefined,
    //   activeImage: activeImage
    // })

    console.warn(
      'FullScreen modal opening: Legacy messaging removed, implement RPC method openFullScreenModal',
      {
        activeImage: activeImage.id,
      },
    )
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
      <ErrorSnackbar onRetry={regenerate} />

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
