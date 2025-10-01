import React, { useRef, ChangeEvent } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import {
  ErrorSnackbar,
  UploadPrompt,
  UploadPreview,
  UploadResult,
  PrimaryButton,
} from '@/components'
import { useQrUpload } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './QrUpload.module.scss'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function QrUploadMobile() {
  const { token } = useParams<{ token: string }>()
  const query = useQuery()
  const apiKey = query.get('apiKey') || ''
  const userId = query.get('userId') || ''

  const { uploadState, selectFile, uploadFile } = useQrUpload({
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

  // Show Next button only when UploadPreview is displayed and not uploading
  const showNextButton =
    uploadState.selectedFile && !uploadState.uploadedUrl && !uploadState.isUploading

  return (
    <>
      <header className={styles.header}>
        <h1 className={combineClassNames('aiuta-page-title', styles.pageTitle)}>Virtual Try On</h1>
      </header>

      <main className={styles.qrUpload}>
        <ErrorSnackbar />

        {!uploadState.selectedFile ? (
          <UploadPrompt onClick={handleButtonClick} />
        ) : !uploadState.uploadedUrl ? (
          <UploadPreview
            selectedFile={uploadState.selectedFile}
            isUploading={uploadState.isUploading}
            onChangePhoto={handleButtonClick}
          />
        ) : (
          <UploadResult uploadedUrl={uploadState.uploadedUrl} />
        )}

        <PrimaryButton
          onClick={uploadFile}
          className={combineClassNames(
            styles.nextButton,
            !showNextButton && styles.nextButton_hidden,
          )}
        >
          Next
        </PrimaryButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChoosePhoto}
          style={{ display: 'none' }}
        />
      </main>
    </>
  )
}
