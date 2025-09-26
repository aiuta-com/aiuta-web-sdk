import React, { useEffect, ChangeEvent } from 'react'
import { ErrorSnackbar, QrCode, Spinner } from '@/components'
import { useQrPrompt } from '@/hooks'
import styles from './QrPrompt.module.scss'

export default function QrPromptPage() {
  const { qrUrl, uploadFromDevice, startPolling, isDownloading, isUploading } = useQrPrompt()

  // Start QR polling on mount
  useEffect(() => {
    if (qrUrl) {
      startPolling()
    }
  }, [qrUrl, startPolling])

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files?.[0]) {
      await uploadFromDevice(event.target.files[0])
    }
  }

  return (
    <div className={styles.qrPrompt}>
      <ErrorSnackbar />
      {qrUrl ? (
        isDownloading || isUploading ? (
          <Spinner isVisible={true} />
        ) : (
          <div className={styles.content}>
            <QrCode url={qrUrl} />
            <div className={styles.options}>
              <p className={`aiuta-button-m ${styles.qrHint}`}>Scan the QR code</p>
              <p className={`aiuta-label-regular ${styles.or}`}>Or</p>
              <label htmlFor="upload-file" className={`aiuta-button-m ${styles.uploadButton}`}>
                Click here to upload
                <input
                  onChange={handleChoosePhoto}
                  type="file"
                  id="upload-file"
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )
      ) : null}
    </div>
  )
}
