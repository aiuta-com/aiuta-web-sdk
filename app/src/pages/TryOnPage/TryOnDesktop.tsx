import React, { useEffect, useState } from 'react'
import { motion, easeInOut } from 'framer-motion'
import { useAppSelector } from '@/store/store'
import {
  currentTryOnImageSelector,
  isGeneratingSelector,
  generatedImageUrlSelector,
  isAbortedSelector,
} from '@/store/slices/tryOnSlice'

// TODO: Replace with RPC - need to support opening fullscreen modal from iframe to SDK
// Required data: { images: InputImage[], modalType?: string }

import { ErrorSnackbar, Section, TryOnButton } from '@/components'
import { AbortAlert, ImageManager } from '@/components'
import { useTryOnGeneration, usePhotoGallery } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
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
  const uploadedViewFile = useAppSelector(currentTryOnImageSelector)
  const isStartGeneration = useAppSelector(isGeneratingSelector)
  const generatedImageUrl = useAppSelector(generatedImageUrlSelector)
  const isOpenAbortedModal = useAppSelector(isAbortedSelector)

  const { getRecentPhoto } = usePhotoGallery()
  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()

  const [recentImage, setRecentImage] = useState<InputImage | null>(null)

  const handleShowFullScreen = (activeImage: InputImage) => {
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

  const hasInputImage = uploadedViewFile.localUrl.length > 0
  const showTryOnButton = !isStartGeneration && !isOpenAbortedModal

  useEffect(() => {
    if (!hasInputImage) {
      const recent = getRecentPhoto()
      setRecentImage(recent)
    }
  }, [hasInputImage, getRecentPhoto])

  return (
    <>
      <AbortAlert isOpen={isOpenAbortedModal} onClose={closeAbortedModal} />
      <ErrorSnackbar onRetry={regenerate} />

      <Section>
        <motion.div key="tryon-desktop" className={styles.tryOnContainer} {...animationConfig}>
          <div className={styles.tryOnContent}>
            <ImageManager
              uploadedImage={hasInputImage ? uploadedViewFile : undefined}
              recentImage={recentImage || undefined}
              isStartGeneration={isStartGeneration}
              generatedImageUrl={generatedImageUrl}
              onImageClick={handleShowFullScreen}
              showFullScreenOnClick={true}
            />
          </div>
          {showTryOnButton && (hasInputImage || recentImage) && (
            <TryOnButton isShowTryOnIcon onClick={() => startTryOn()}>
              Try On
            </TryOnButton>
          )}
        </motion.div>
      </Section>
    </>
  )
}
