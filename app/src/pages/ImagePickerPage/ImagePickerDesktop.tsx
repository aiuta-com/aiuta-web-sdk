import React, { useEffect, ChangeEvent } from 'react'
import { ErrorSnackbar, QrCode } from '@/components'
import { useQrUpload, useTryOnAnalytics } from '@/hooks'
import styles from './ImagePicker.module.scss'

export default function ImagePickerDesktop() {
  const { qrUrl, uploadFromDevice, startPolling } = useQrUpload()
  const { trackTryOnInitiated } = useTryOnAnalytics()

  // Start QR polling on mount
  useEffect(() => {
    if (qrUrl) {
      startPolling()
      trackTryOnInitiated()
    }
  }, [qrUrl, startPolling, trackTryOnInitiated])

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files?.[0]) {
      await uploadFromDevice(event.target.files[0])
    }
  }

  return (
    <div className={styles.imagePicker}>
      <ErrorSnackbar />
      {qrUrl ? (
        <div className={styles.qrContent}>
          <QrCode url={qrUrl} />
          <div className={styles.uploadInfo}>
            <p className={styles.scanText}>Scan the QR code</p>
            <p className={styles.orText}>Or</p>
            <label htmlFor="upload-file" className={styles.uploadButton}>
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
      ) : null}
    </div>
  )
}
