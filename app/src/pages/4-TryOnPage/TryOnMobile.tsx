import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { appSlice } from '@/store/slices/appSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import {
  currentTryOnImageSelector,
  isGeneratingSelector,
  isAbortedSelector,
} from '@/store/slices/tryOnSlice'
import { UploadHistorySheet, ErrorSnackbar, TryOnButton, DeletableImage } from '@/components'
import { AbortAlert, TryOnViewer } from '@/components'
import { useTryOnGeneration, useUploadsGallery, useImageUpload } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import styles from './TryOn.module.scss'

export default function TryOnMobile() {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOpenSwip = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const uploadedViewFile = useAppSelector(currentTryOnImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const isOpenAbortedModal = useAppSelector(isAbortedSelector)

  const { recentlyPhotos, handleImageDelete: removePhotoFromGallery } = useUploadsGallery()

  const { uploadImage } = useImageUpload({ withinGenerationFlow: true })

  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()

  const [recentImage, setRecentImage] = useState<InputImage | null>(null)

  const handleOpenSwip = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
  }

  const handleChooseNewPhoto = (id: string, url: string) => {
    setTimeout(() => {
      dispatch(tryOnSlice.actions.setIsGenerating(true))
      dispatch(tryOnSlice.actions.setCurrentImage({ id, url, localUrl: url }))
      startTryOn({ id, url })
    }, 300)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.files) {
      const file = event.target.files[0]
      if (!file) return

      await uploadImage(file, (result: InputImage) => {
        startTryOn(result)
        if (isOpenSwip) dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      })
    }
  }

  const hasInputImage = uploadedViewFile.localUrl.length > 0
  const hasRecentPhotos = recentlyPhotos && recentlyPhotos.length > 0
  const showTryOnButton = !isGenerating && (hasInputImage || recentImage)

  useEffect(() => {
    if (!hasInputImage && hasRecentPhotos) {
      setRecentImage(recentlyPhotos[0])
      dispatch(appSlice.actions.setHasFooter(true))
    }
  }, [recentlyPhotos, hasInputImage, dispatch, hasRecentPhotos])

  return (
    <main className={styles.tryOn_mobile}>
      <div className={styles.container_mobile}>
        <AbortAlert isOpen={isOpenAbortedModal} onClose={closeAbortedModal} />
        <ErrorSnackbar onRetry={regenerate} />
        <div />

        <div className={styles.content_mobile}>
          <TryOnViewer
            uploadedImageUrl={uploadedViewFile.localUrl}
            recentImageUrl={recentImage?.url}
            isGenerating={isGenerating}
            onChangeImage={hasInputImage ? handleButtonClick : handleOpenSwip}
            onUploadClick={handleButtonClick}
          />
        </div>

        {showTryOnButton && <TryOnButton onClick={() => startTryOn()}>Try On</TryOnButton>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChoosePhoto}
          style={{ display: 'none' }}
        />

        <UploadHistorySheet onClickButton={handleButtonClick} buttonText="+ Upload new photo">
          <div className={styles.imageContent_mobile}>
            {recentlyPhotos.length > 0
              ? recentlyPhotos.map((item: InputImage, index) => (
                  <DeletableImage
                    key={`${item.id}-${index}-${recentlyPhotos.length}`}
                    src={item.url}
                    imageId={item.id}
                    showTrashIcon={true}
                    classNames={styles.imageBox_mobile}
                    onDelete={removePhotoFromGallery}
                    onClick={() => handleChooseNewPhoto(item.id, item.url)}
                  />
                ))
              : null}
          </div>
        </UploadHistorySheet>
      </div>
    </main>
  )
}
