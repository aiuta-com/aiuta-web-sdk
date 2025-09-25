import React, { useRef, ChangeEvent } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { PrimaryButton, ErrorSnackbar, Spinner } from '@/components'
import { useQrToken } from '@/hooks'
import styles from './QrUploadHelper.module.scss'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function QrUploadHelper() {
  const { token } = useParams<{ token: string }>()
  const query = useQuery()
  const apiKey = query.get('apiKey') || ''
  const userId = query.get('userId') || ''

  const { uploadState, selectFile, uploadFile } = useQrToken({
    token,
    apiKey,
    subscriptionId: userId || undefined,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleChoosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files?.[0]) {
      selectFile(event.target.files[0])
    }
  }

  return (
    <div className={styles.qrUploadHelper}>
      <ErrorSnackbar />
      {uploadState.selectedFile && !uploadState.uploadedUrl ? (
        <div className={styles.uploadedContent}>
          <div className={styles.uploadedBox}>
            <div className={styles.uploadPreview}>
              <img
                src={uploadState.selectedFile.url}
                alt="Selected photo preview"
                className={styles.viewItem}
              />
              {uploadState.isUploading && <Spinner isVisible={uploadState.isUploading} />}
              {!uploadState.isUploading && (
                <button className={styles.changePhotoButton} onClick={handleButtonClick}>
                  Change photo
                </button>
              )}
            </div>
          </div>
          <PrimaryButton onClick={uploadFile}>Next</PrimaryButton>
        </div>
      ) : !uploadState.uploadedUrl ? (
        <div className={styles.banner}>
          <img src={'./icons/tokenBannerGirl.svg'} alt="Girl icon" />
          <div className={styles.uploadButtonContent}>
            <PrimaryButton onClick={handleButtonClick}>Upload a photo of you</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className={styles.resultContent}>
          <div className={styles.resultImageBox}>
            <img alt="Success icon" src={'./icons/success.svg'} className={styles.successIcon} />
            <img
              width={160}
              height={245}
              alt="Uploaded photo"
              className={styles.resultImage}
              src={uploadState.uploadedUrl}
            />
          </div>
          <div className={styles.infoContent}>
            <h3>Your photo has been uploaded</h3>
            <h4>It will appear within a few seconds</h4>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChoosePhoto}
        style={{ display: 'none' }}
      />
    </div>
  )
}
