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
  productIdSelector,
} from '@/store/slices/tryOnSlice'
import {
  UploadsHistorySheet,
  ErrorSnackbar,
  TryOnButton,
  UploadPrompt,
  Spinner,
} from '@/components'
import { AbortAlert, TryOnView } from '@/components'
import { useTryOnGeneration, useImageUpload, useUploadsGallery, useTryOnStrings } from '@/hooks'
import { useRpc } from '@/contexts'
import { InputImage } from '@/utils/api/tryOnApiService'
import styles from './TryOn.module.scss'

export default function TryOnMobile() {
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBottomSheetOpen = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const currentTryOnImage = useAppSelector(currentTryOnImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const isAborted = useAppSelector(isAbortedSelector)
  const productId = useAppSelector(productIdSelector)

  const { recentlyPhotos: recentPhotos } = useUploadsGallery()
  const { uploadImage, isUploading } = useImageUpload()
  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()
  const { tryOn } = useTryOnStrings()
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

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'imagePicker',
      productIds: [productId],
    })
  }, [rpc, productId])

  useEffect(() => {
    if (!hasInputImage && hasRecentPhotos) {
      setRecentImage(recentPhotos[0])
    } else if (hasInputImage && hasRecentPhotos && !recentImage) {
      setRecentImage(recentPhotos[0])
    } else if (!hasInputImage && !hasRecentPhotos) {
      // No uploaded image and no recent photos - reset state
      setRecentImage(null)
      // Close bottom sheet if it's open
      if (isBottomSheetOpen) {
        dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      }
    } else if (hasInputImage && recentImage && !hasRecentPhotos) {
      // Has uploaded image but recent image is no longer valid (deleted from history)
      // This means user deleted all history, so reset everything to show upload prompt
      setRecentImage(null)
      dispatch(tryOnSlice.actions.clearCurrentImage()) // Clear uploaded image too
      // Close bottom sheet if it's open
      if (isBottomSheetOpen) {
        dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      }
    } else if (hasInputImage && recentImage && hasRecentPhotos) {
      // Check if current recentImage still exists in the photos list
      const isRecentImageStillValid = recentPhotos.some((photo) => photo.id === recentImage.id)
      if (!isRecentImageStillValid) {
        setRecentImage(null)
        // Close bottom sheet if it's open
        if (isBottomSheetOpen) {
          dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
        }
      }
    }
  }, [recentPhotos, hasInputImage, dispatch, hasRecentPhotos, isBottomSheetOpen, recentImage])

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
            {tryOn}
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
