import React, { useRef, ChangeEvent } from 'react'
import { useParams, useLocation } from 'react-router-dom'

// components
import { TryOnButton, ViewImage } from '@/components/feature'

// hooks
import { useQrToken } from '../../hooks'

// styles
import styles from './photoUpload.module.scss'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function PhotoUploadMobile() {
  const { token } = useParams<{ token: string }>()
  const query = useQuery()
  const apiKey = query.get('apiKey') || ''
  const userId = query.get('userId') || ''

  const { uploadState, selectFile, uploadFile } = useQrToken({
    token,
    apiKey,
    userId: userId || undefined,
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
    <div className={styles.tokenContainer}>
      {uploadState.selectedFile && !uploadState.uploadedUrl ? (
        <div className={styles.uploadedContent}>
          <div className={styles.uploadedBox}>
            <ViewImage
              imgUnoptimazed={true}
              url={uploadState.selectedFile.url}
              className={styles.viewItem}
              isStartGeneration={uploadState.isUploading}
              isShowChangeImageBtn={!uploadState.isUploading}
              onChange={handleButtonClick}
            />
          </div>
          <TryOnButton onClick={uploadFile}>Next</TryOnButton>
        </div>
      ) : !uploadState.uploadedUrl ? (
        <div className={styles.banner}>
          <img src={'./icons/tokenBannerGirl.svg'} alt="Girl icon" />
          <div className={styles.uploadBtnContent}>
            <TryOnButton onClick={handleButtonClick}>Upload a photo of you</TryOnButton>
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
              className={styles.resultImg}
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
