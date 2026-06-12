import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ErrorSnackbar,
  QrCode,
  Spinner,
  FilePicker,
  PrimaryButton,
  ModelsButton,
  Icon,
} from '@/components'
import { icons } from './icons'
import {
  useQrPrompt,
  useTryOnImage,
  useImagePickerStrings,
  usePredefinedModels,
  usePredefinedModelsAnalytics,
} from '@/hooks'
import { useRpc, useDragAndDropContext } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { combineClassNames } from '@/utils'
import styles from './QrPrompt.module.scss'

export default function QrPromptDesktop() {
  const navigate = useNavigate()
  const rpc = useRpc()
  const productIds = useAppSelector(productIdsSelector)
  const { qrUrl, startPolling, isDownloading } = useQrPrompt()
  const { selectImageToTryOn } = useTryOnImage()
  const { qrPromptDescription, qrPromptUploadButton } = useImagePickerStrings()
  const { isEnabled: isPredefinedModelsEnabled } = usePredefinedModels()
  const { trackSelectModelButtonClick } = usePredefinedModelsAnalytics()
  const { isDragging } = useDragAndDropContext()

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'qrPrompt',
      productIds,
    })
  }, [rpc, productIds])

  // Start QR polling on mount
  useEffect(() => {
    if (qrUrl) {
      startPolling()
    }
  }, [qrUrl, startPolling])

  const handleFileSelect = useCallback(
    async (file: File) => {
      await selectImageToTryOn(file)
      navigate('/tryon')
    },
    [selectImageToTryOn, navigate],
  )

  const handleSelectModel = useCallback(() => {
    trackSelectModelButtonClick()
    navigate('/models')
  }, [navigate, trackSelectModelButtonClick])

  return (
    <main className={styles.qrPrompt}>
      <ErrorSnackbar />
      {!qrUrl ? (
        <Spinner isVisible={true} />
      ) : isDownloading ? (
        <Spinner isVisible={true} />
      ) : (
        <div className={combineClassNames(styles.dropZone, isDragging && styles.dropZone_dragging)}>
          <QrCode url={qrUrl} />
          <p className={`aiuta-label-regular ${styles.description}`}>{qrPromptDescription}</p>

          <FilePicker onFileSelect={handleFileSelect}>
            {({ openFilePicker }) => (
              <PrimaryButton
                onClick={openFilePicker}
                maxWidth={false}
                className={styles.uploadButton}
              >
                <Icon icon={icons.upload} size={20} viewBox="0 0 20 20" />
                {qrPromptUploadButton}
              </PrimaryButton>
            )}
          </FilePicker>

          {isPredefinedModelsEnabled && (
            <div className={styles.modelsSlot}>
              <ModelsButton onClick={handleSelectModel} />
            </div>
          )}
        </div>
      )}
    </main>
  )
}
