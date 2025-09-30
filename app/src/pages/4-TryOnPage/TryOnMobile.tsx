import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { flushSync } from 'react-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
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
  UploadPrompt,
  Spinner,
} from '@/components'
import { AbortAlert, TryOnView } from '@/components'
import { useTryOnGeneration, useImageUpload, useUploadsGallery } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import styles from './TryOn.module.scss'

export default function TryOnMobile() {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBottomSheetOpen = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const currentTryOnImage = useAppSelector(currentTryOnImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const isAborted = useAppSelector(isAbortedSelector)

  const { recentlyPhotos: recentPhotos } = useUploadsGallery()
  const { uploadImage, isUploading } = useImageUpload()
  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()
  const [recentImage, setRecentImage] = useState<InputImage | null>(null)
  const [isButtonClicked, setIsButtonClicked] = useState(false)

  const handleOpenBottomSheet = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
  }

  const handleChooseNewPhoto = (id: string, url: string) => {
    // Close the bottom sheet first
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))

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

      // Close the bottom sheet before starting upload
      if (isBottomSheetOpen) {
        dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      }

      await uploadImage(file, (result: InputImage) => {
        startTryOn(result)
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

      {isUploading ? (
        <Spinner isVisible={true} />
      ) : (
        <>
          {currentImageUrl ? (
            <TryOnView
              uploadedImageUrl={currentTryOnImage.localUrl}
              recentImageUrl={recentImage?.url}
              isGenerating={isGenerating}
              onChangePhoto={hasRecentPhotos ? handleOpenBottomSheet : handleFileInputClick}
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
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      <UploadsHistorySheet
        onClickButton={handleFileInputClick}
        onImageSelect={handleChooseNewPhoto}
      />
    </main>
  )
}
