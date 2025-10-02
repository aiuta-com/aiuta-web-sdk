import React, { useRef, ChangeEvent } from 'react'
import {
  ErrorSnackbar,
  UploadPrompt,
  UploadPreview,
  UploadResult,
  PrimaryButton,
} from '@/components'
import { useQrUpload, useImagePickerStrings, useTryOnStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './QrUpload.module.scss'

export default function QrUploadMobile() {
  const { uploadState, selectFile, uploadFile } = useQrUpload()
  const { qrUploadNextButton } = useImagePickerStrings()
  const { tryOnPageTitle } = useTryOnStrings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
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
        <h1 className={combineClassNames('aiuta-page-title', styles.pageTitle)}>
          {tryOnPageTitle}
        </h1>
      </header>

      <main className={styles.qrUpload}>
        <ErrorSnackbar />

        {!uploadState.selectedFile ? (
          <UploadPrompt onClick={handleOpenFileDialog} />
        ) : !uploadState.uploadedUrl ? (
          <UploadPreview
            selectedFile={uploadState.selectedFile}
            isUploading={uploadState.isUploading}
            onChangePhoto={handleOpenFileDialog}
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
          {qrUploadNextButton}
        </PrimaryButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </main>
    </>
  )
}
