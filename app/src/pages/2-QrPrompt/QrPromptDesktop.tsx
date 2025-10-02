import React, { useEffect, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorSnackbar, QrCode, Spinner } from '@/components'
import { useQrPrompt, useImageUpload, useImagePickerStrings } from '@/hooks'
import styles from './QrPrompt.module.scss'

export default function QrPromptDesktop() {
  const navigate = useNavigate()
  const { qrUrl, startPolling, isDownloading } = useQrPrompt()
  const { uploadImage, isUploading } = useImageUpload()
  const { qrPromptHint, qrPromptOr, qrPromptUploadButton } = useImagePickerStrings()

  // Start QR polling on mount
  useEffect(() => {
    if (qrUrl) {
      startPolling()
    }
  }, [qrUrl, startPolling])

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files?.[0]) {
      await uploadImage(event.target.files[0], () => {
        // Navigate to try-on page with footer disabled (like QR flow)
        navigate('/tryon')
      })
    }
  }

  return (
    <main className={styles.qrPrompt}>
      <ErrorSnackbar />
      {qrUrl ? (
        isDownloading || isUploading ? (
          <Spinner isVisible={true} />
        ) : (
          <>
            <QrCode url={qrUrl} />
            <div className={styles.options}>
              <p className={`aiuta-button-m ${styles.qrHint}`}>{qrPromptHint}</p>
              <p className={`aiuta-label-regular ${styles.or}`}>{qrPromptOr}</p>
              <label htmlFor="upload-file" className={`aiuta-button-m ${styles.uploadButton}`}>
                {qrPromptUploadButton}
                <input
                  onChange={handleChoosePhoto}
                  type="file"
                  id="upload-file"
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </>
        )
      ) : null}
    </main>
  )
}
