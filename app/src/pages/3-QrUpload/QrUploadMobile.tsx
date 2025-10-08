import React from 'react'
import {
  ErrorSnackbar,
  UploadPrompt,
  UploadPreview,
  UploadResult,
  PrimaryButton,
  FilePicker,
} from '@/components'
import { useQrUpload, useImagePickerStrings, useTryOnStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './QrUpload.module.scss'

export default function QrUploadMobile() {
  const { uploadState, selectFile, uploadFile } = useQrUpload()
  const { qrUploadNextButton } = useImagePickerStrings()
  const { tryOnPageTitle } = useTryOnStrings()

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

        <FilePicker onFileSelect={selectFile}>
          {({ openFilePicker }) => (
            <>
              {!uploadState.selectedFile ? (
                <UploadPrompt onClick={openFilePicker} />
              ) : !uploadState.uploadedUrl ? (
                <UploadPreview
                  selectedFile={uploadState.selectedFile}
                  isUploading={uploadState.isUploading}
                  onChangePhoto={openFilePicker}
                />
              ) : (
                <UploadResult uploadedUrl={uploadState.uploadedUrl} />
              )}
            </>
          )}
        </FilePicker>

        <PrimaryButton
          onClick={uploadFile}
          className={combineClassNames(
            styles.nextButton,
            !showNextButton && styles.nextButton_hidden,
          )}
        >
          {qrUploadNextButton}
        </PrimaryButton>
      </main>
    </>
  )
}
