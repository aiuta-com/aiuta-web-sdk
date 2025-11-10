import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import {
  selectedImageSelector,
  isGeneratingSelector,
  productIdSelector,
} from '@/store/slices/tryOnSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { ErrorSnackbar, TryOnButton, TryOnView } from '@/components'
import { useTryOnGeneration, useUploadsGallery, useTryOnStrings } from '@/hooks'
import { useRpc } from '@/contexts'
import styles from './TryOn.module.scss'

export default function TryOnDesktop() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpc()

  const selectedImage = useAppSelector(selectedImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const productId = useAppSelector(productIdSelector)

  const { getRecentPhoto } = useUploadsGallery()
  const { startTryOn, retryTryOn } = useTryOnGeneration()
  const { tryOn } = useTryOnStrings()

  const handleChangePhoto = () => {
    navigate('/uploads')
  }

  const hasImage = selectedImage !== null
  const showTryOnButton = !isGenerating && hasImage

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'imagePicker',
      productIds: [productId],
    })
  }, [rpc, productId])

  // Auto-select recent photo if no image is selected
  useEffect(() => {
    if (!selectedImage) {
      const recent = getRecentPhoto()
      if (recent) {
        dispatch(tryOnSlice.actions.setSelectedImage(recent))
      }
    }
  }, [selectedImage, getRecentPhoto, dispatch])

  return (
    <main className={styles.tryOn}>
      <ErrorSnackbar onRetry={retryTryOn} />

      <TryOnView
        image={selectedImage}
        isGenerating={isGenerating}
        onChangePhoto={handleChangePhoto}
      />

      <TryOnButton onClick={() => startTryOn()} hidden={!showTryOnButton}>
        {tryOn}
      </TryOnButton>
    </main>
  )
}
