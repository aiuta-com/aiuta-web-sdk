import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import {
  selectedImageSelector,
  isGeneratingSelector,
  productIdsSelector,
} from '@/store/slices/tryOnSlice'
import { ErrorSnackbar, TryOnButton, TryOnView, TryOnStatus, SecondaryButton } from '@/components'
import {
  useTryOnGeneration,
  useTryOnStrings,
  useImagePickerStrings,
  useSelectedUploadSync,
} from '@/hooks'
import { useRpc } from '@/contexts'
import styles from './TryOn.module.scss'

export default function TryOnDesktop() {
  const navigate = useNavigate()
  const rpc = useRpc()

  const selectedImage = useAppSelector(selectedImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const productIds = useAppSelector(productIdsSelector)

  const { startTryOn, retryTryOn } = useTryOnGeneration()
  const { tryOn } = useTryOnStrings()
  const { uploadsHistoryButtonChangePhoto } = useImagePickerStrings()

  // Keep the preview in sync with the uploads list (auto-select / drop deleted)
  useSelectedUploadSync()

  const handleChangePhoto = () => {
    navigate('/uploads')
  }

  const hasImage = selectedImage !== null

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'imagePicker',
      productIds,
    })
  }, [rpc, productIds])

  return (
    <main className={styles.tryOn}>
      <ErrorSnackbar onRetry={retryTryOn} />

      <TryOnView image={selectedImage} isGenerating={isGenerating} fill />

      {hasImage &&
        (isGenerating ? (
          // The status takes the action row's place (Figma) so the layout
          // doesn't jump when the generation starts
          <div className={styles.loadingRow}>
            <TryOnStatus />
          </div>
        ) : (
          <div className={styles.actions}>
            <SecondaryButton onClick={handleChangePhoto} shape="M" classNames={styles.action}>
              {uploadsHistoryButtonChangePhoto}
            </SecondaryButton>
            <TryOnButton onClick={() => startTryOn()} className={styles.action}>
              {tryOn}
            </TryOnButton>
          </div>
        ))}
    </main>
  )
}
