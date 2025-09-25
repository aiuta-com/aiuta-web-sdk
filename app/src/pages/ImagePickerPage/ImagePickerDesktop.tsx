import React, { useEffect, ChangeEvent } from 'react'
import { ErrorSnackbar, QrCode, Spinner } from '@/components'
import { useQrUpload, useTryOnAnalytics } from '@/hooks'
import { useAppSelector } from '@/store/store'
import { qrIsLoadingSelector } from '@/store/slices/qrSlice'
import styles from './ImagePicker.module.scss'

export default function ImagePickerDesktop() {
  const { qrUrl, uploadFromDevice, startPolling } = useQrUpload()
  const { trackTryOnInitiated } = useTryOnAnalytics()
  const isShowQrSpinner = useAppSelector(qrIsLoadingSelector)

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
        isShowQrSpinner ? (
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
