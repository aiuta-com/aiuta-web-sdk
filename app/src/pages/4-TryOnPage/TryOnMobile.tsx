import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { flushSync } from 'react-dom'
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
import {
  UploadsHistorySheet,
  ErrorSnackbar,
  TryOnButton,
  DeletableImage,
  UploadPrompt,
} from '@/components'
import { AbortAlert, TryOnView } from '@/components'
import { useTryOnGeneration, useUploadsGallery, useImageUpload } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import styles from './TryOn.module.scss'

export default function TryOnMobile() {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBottomSheetOpen = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const currentTryOnImage = useAppSelector(currentTryOnImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const isAborted = useAppSelector(isAbortedSelector)

  const { recentlyPhotos: recentPhotos, handleImageDelete: removePhotoFromGallery } =
    useUploadsGallery()
  const { uploadImage } = useImageUpload({ withinGenerationFlow: true })
  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()
  const [recentImage, setRecentImage] = useState<InputImage | null>(null)
  const [isButtonClicked, setIsButtonClicked] = useState(false)

  const handleOpenBottomSheet = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
  }

  const handleChooseNewPhoto = (id: string, url: string) => {
    setTimeout(() => {
      dispatch(tryOnSlice.actions.setIsGenerating(true))
      dispatch(tryOnSlice.actions.setCurrentImage({ id, url, localUrl: url }))
      startTryOn({ id, url })
    }, 300)
  }

  const handleFileInputClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.files) {
      const file = event.target.files[0]
      if (!file) return

      await uploadImage(file, (result: InputImage) => {
        startTryOn(result)
        if (isBottomSheetOpen) {
          dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
        }
      })
    }
  }

  const hasInputImage = currentTryOnImage.localUrl.length > 0
  const hasRecentPhotos = recentPhotos && recentPhotos.length > 0
  const hasRecentImage = recentImage && recentImage.url && recentImage.url.length > 0
  const showTryOnButton =
    !isGenerating && !isAborted && !isButtonClicked && (hasInputImage || recentImage)

  const handleTryOnClick = () => {
    flushSync(() => {
      setIsButtonClicked(true)
    })
    startTryOn()
  }

  useEffect(() => {
    if (!hasInputImage && hasRecentPhotos) {
      setRecentImage(recentPhotos[0])
      dispatch(appSlice.actions.setHasFooter(true))
    }
  }, [recentPhotos, hasInputImage, dispatch, hasRecentPhotos])

  // Reset button clicked state when generation finishes
  useEffect(() => {
    if (!isGenerating) {
      setIsButtonClicked(false)
    }
  }, [isGenerating])

  // Determine which image to show
  const currentImageUrl = hasInputImage
    ? currentTryOnImage.localUrl
    : hasRecentImage
      ? recentImage?.url
      : null

  return (
    <main className={styles.tryOn}>
      <AbortAlert isOpen={isAborted} onClose={closeAbortedModal} />
      <ErrorSnackbar onRetry={regenerate} />

      {currentImageUrl ? (
        <TryOnView
          uploadedImageUrl={currentTryOnImage.localUrl}
          recentImageUrl={recentImage?.url}
          isGenerating={isGenerating}
          onChangePhoto={hasInputImage ? handleFileInputClick : handleOpenBottomSheet}
        />
      ) : (
        <UploadPrompt onClick={handleFileInputClick} />
      )}

      <TryOnButton
        onClick={handleTryOnClick}
        hidden={!showTryOnButton || (!hasInputImage && !recentImage)}
      >
        Try On
      </TryOnButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      <UploadsHistorySheet onClickButton={handleFileInputClick} buttonText="+ Upload new photo">
        <div className={styles.imageContent_mobile}>
          {recentPhotos.length > 0
            ? recentPhotos.map((item: InputImage, index) => (
                <DeletableImage
                  key={`${item.id}-${index}-${recentPhotos.length}`}
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
      </UploadsHistorySheet>
    </main>
  )
}
