import React from 'react'
import {
  ErrorSnackbar,
  UploadPrompt,
  UploadResult,
  PrimaryButton,
  SecondaryButton,
  FilePicker,
  PoweredBy,
  Flex,
  RemoteImage,
  LoaderRing,
} from '@/components'
import { useQrUpload, useImagePickerStrings, useTryOnStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './QrUpload.module.scss'

export default function QrUploadMobile() {
  const { uploadState, selectFile, uploadFile } = useQrUpload()
  const { qrUploadNextButton, uploadsHistoryButtonChangePhoto } = useImagePickerStrings()
  const { tryOnPageTitle, tryOnLoadingStatusUploadingImage } = useTryOnStrings()

  const { selectedFile, uploadedUrl, isUploading } = uploadState

  // Preview + loading share the photo-selected layout (navbar + full-bleed
  // image); the empty state mirrors the main upload screen with no navbar
  const hasSelection = !!selectedFile && !uploadedUrl
  const showPoweredBy = !selectedFile && !uploadedUrl

  return (
    <>
      {hasSelection && (
        <header className={styles.navbar}>
          <h1 className={combineClassNames('aiuta-page-title', styles.navbarTitle)}>
            {tryOnPageTitle}
          </h1>
        </header>
      )}

      <main className={styles.qrUpload}>
        <ErrorSnackbar />

        <FilePicker onFileSelect={selectFile}>
          {({ openFilePicker }) => (
            <>
              {!selectedFile ? (
                <UploadPrompt onClick={openFilePicker} />
              ) : !uploadedUrl ? (
                <>
                  <Flex
                    containerClassName={styles.fillContainer}
                    contentClassName={combineClassNames(
                      'aiuta-image-m',
                      styles.fillContent,
                      isUploading && styles.loadingVeil,
                    )}
                  >
                    <RemoteImage
                      src={selectedFile.url}
                      alt="Selected photo preview"
                      shape="M"
                      fit="smart"
                    />
                  </Flex>

                  {isUploading ? (
                    <div className={styles.loadingRow}>
                      <LoaderRing />
                      <span>{tryOnLoadingStatusUploadingImage}</span>
                    </div>
                  ) : (
                    <div className={styles.actions}>
                      <PrimaryButton
                        onClick={uploadFile}
                        maxWidth={false}
                        className={styles.action}
                      >
                        {qrUploadNextButton}
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={openFilePicker}
                        shape="M"
                        classNames={styles.action}
                      >
                        {uploadsHistoryButtonChangePhoto}
                      </SecondaryButton>
                    </div>
                  )}
                </>
              ) : (
                <UploadResult uploadedUrl={uploadedUrl} />
              )}
            </>
          )}
        </FilePicker>
      </main>

      {showPoweredBy && (
        <div className={styles.poweredByWrap}>
          <PoweredBy />
        </div>
      )}
    </>
  )
}
