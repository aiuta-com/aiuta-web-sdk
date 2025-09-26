import React, { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import {
  currentTryOnImageSelector,
  isGeneratingSelector,
  generatedImageUrlSelector,
  isAbortedSelector,
} from '@/store/slices/tryOnSlice'

// TODO: Replace with RPC - need to support opening fullscreen modal from iframe to SDK
// Required data: { images: InputImage[], modalType?: string }

import { ErrorSnackbar, TryOnButton } from '@/components'
import { AbortAlert, ImageManager } from '@/components'
import { useTryOnGeneration, useUploadsGallery } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import styles from './TryOn.module.scss'

export default function TryOnDesktop() {
  const navigate = useNavigate()
  const uploadedViewFile = useAppSelector(currentTryOnImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const generatedImageUrl = useAppSelector(generatedImageUrlSelector)
  const isAborted = useAppSelector(isAbortedSelector)

  const { getRecentPhoto } = useUploadsGallery()
  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()

  const [recentImage, setRecentImage] = useState<InputImage | null>(null)
  const [isButtonClicked, setIsButtonClicked] = useState(false)

  const handleChangePhoto = () => {
    navigate('/uploads-history')
  }

  const hasInputImage = uploadedViewFile.localUrl.length > 0
  const showTryOnButton = !isGenerating && !isAborted && !isButtonClicked

  // Debug
  console.log('State:', { isGenerating, isAborted, isButtonClicked, showTryOnButton })

  const handleTryOnClick = () => {
    console.log('Button clicked, hiding immediately')
    flushSync(() => {
      setIsButtonClicked(true)
    })
    startTryOn()
  }

  useEffect(() => {
    if (!hasInputImage) {
      const recent = getRecentPhoto()
      setRecentImage(recent)
    }
  }, [hasInputImage, getRecentPhoto])

  // Reset button clicked state when generation finishes
  useEffect(() => {
    if (!isGenerating) {
      setIsButtonClicked(false)
    }
  }, [isGenerating])

  return (
    <div className={styles.tryOnPage}>
      <AbortAlert isOpen={isAborted} onClose={closeAbortedModal} />
      <ErrorSnackbar onRetry={regenerate} />

      <div className={styles.tryOnContainer}>
        <div className={styles.tryOnContent}>
          <ImageManager
            uploadedImage={hasInputImage ? uploadedViewFile : undefined}
            recentImage={recentImage || undefined}
            isStartGeneration={isGenerating}
            generatedImageUrl={generatedImageUrl}
            onChangeImage={handleChangePhoto}
          />
        </div>
        <TryOnButton
          isShowTryOnIcon
          onClick={handleTryOnClick}
          hidden={!showTryOnButton || (!hasInputImage && !recentImage)}
        >
          Try On
        </TryOnButton>
      </div>
    </div>
  )
}
