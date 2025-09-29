import React, { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import {
  currentTryOnImageSelector,
  isGeneratingSelector,
  isAbortedSelector,
} from '@/store/slices/tryOnSlice'
import { ErrorSnackbar, TryOnButton } from '@/components'
import { AbortAlert, TryOnViewer } from '@/components'
import { useTryOnGeneration, useUploadsGallery } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import styles from './TryOn.module.scss'

export default function TryOnDesktop() {
  const navigate = useNavigate()
  const uploadedViewFile = useAppSelector(currentTryOnImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
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

  const handleTryOnClick = () => {
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
    <main className={styles.tryOn}>
      <AbortAlert isOpen={isAborted} onClose={closeAbortedModal} />
      <ErrorSnackbar onRetry={regenerate} />

      <TryOnViewer
        uploadedImageUrl={uploadedViewFile.localUrl}
        recentImageUrl={recentImage?.url}
        isGenerating={isGenerating}
        onChangeImage={handleChangePhoto}
      />

      <TryOnButton
        onClick={handleTryOnClick}
        hidden={!showTryOnButton || (!hasInputImage && !recentImage)}
      >
        Try On
      </TryOnButton>
    </main>
  )
}
