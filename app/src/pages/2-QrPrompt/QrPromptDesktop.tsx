import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorSnackbar, QrCode, Spinner, FilePicker } from '@/components'
import { useQrPrompt, useTryOnImage, useImagePickerStrings } from '@/hooks'
import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import styles from './QrPrompt.module.scss'

export default function QrPromptDesktop() {
  const navigate = useNavigate()
  const rpc = useRpc()
  const productIds = useAppSelector(productIdsSelector)
  const { qrUrl, startPolling, isDownloading } = useQrPrompt()
  const { selectImageToTryOn } = useTryOnImage()
  const { qrPromptHint, qrPromptOr, qrPromptUploadButton } = useImagePickerStrings()

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

  return (
    <main className={styles.qrPrompt}>
      <ErrorSnackbar />
      {qrUrl ? (
        isDownloading ? (
          <Spinner isVisible={true} />
        ) : (
          <>
            <QrCode url={qrUrl} />
            <div className={styles.options}>
              <p className={`aiuta-button-m ${styles.qrHint}`}>{qrPromptHint}</p>
              <p className={`aiuta-label-regular ${styles.or}`}>{qrPromptOr}</p>
              <FilePicker onFileSelect={handleFileSelect}>
                {({ openFilePicker }) => (
                  <button
                    onClick={openFilePicker}
                    className={`aiuta-button-m ${styles.uploadButton}`}
                  >
                    {qrPromptUploadButton}
                  </button>
                )}
              </FilePicker>
            </div>
          </>
        )
      ) : null}
    </main>
  )
}
