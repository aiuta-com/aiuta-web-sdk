import React, { useEffect, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import {
  selectedImageSelector,
  isGeneratingSelector,
  isAbortedSelector,
  productIdSelector,
} from '@/store/slices/tryOnSlice'
import {
  UploadsHistorySheet,
  ErrorSnackbar,
  TryOnButton,
  UploadPrompt,
  FilePicker,
} from '@/components'
import { AbortAlert, TryOnView } from '@/components'
import { useTryOnGeneration, useTryOnImage, useUploadsGallery, useTryOnStrings } from '@/hooks'
import { useRpc } from '@/contexts'
import styles from './TryOn.module.scss'

export default function TryOnMobile() {
  const dispatch = useAppDispatch()
  const rpc = useRpc()

  const isBottomSheetOpen = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const selectedImage = useAppSelector(selectedImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const isAborted = useAppSelector(isAbortedSelector)
  const productId = useAppSelector(productIdSelector)

  const { recentlyPhotos: recentPhotos } = useUploadsGallery()
  const { selectImageToTryOn } = useTryOnImage()
  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()
  const { tryOn } = useTryOnStrings()

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Close the bottom sheet if open
      if (isBottomSheetOpen) {
        dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      }

      // Select image (creates NewImage and saves to Redux)
      await selectImageToTryOn(file)
    },
    [isBottomSheetOpen, dispatch, selectImageToTryOn],
  )

  const handleOpenBottomSheet = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
  }

  const handleChoosePhotoFromHistory = (id: string, url: string) => {
    // Select image from history
    dispatch(tryOnSlice.actions.setSelectedImage({ id, url }))

    // Close the bottom sheet
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
  }

  const hasImage = selectedImage !== null
  const hasRecentPhotos = recentPhotos && recentPhotos.length > 0
  const showTryOnButton = !isGenerating && !isAborted && hasImage

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'imagePicker',
      productIds: [productId],
    })
  }, [rpc, productId])

  // Auto-select recent photo if no image is selected
  useEffect(() => {
    if (!selectedImage && hasRecentPhotos) {
      dispatch(tryOnSlice.actions.setSelectedImage(recentPhotos[0]))
    }
  }, [selectedImage, hasRecentPhotos, recentPhotos, dispatch])

  return (
    <main className={styles.tryOn}>
      <AbortAlert isOpen={isAborted} onClose={closeAbortedModal} />
      <ErrorSnackbar onRetry={regenerate} />

      <FilePicker onFileSelect={handleFileSelect}>
        {({ openFilePicker }) => (
          <>
            {selectedImage ? (
              <TryOnView
                image={selectedImage}
                isGenerating={isGenerating}
                onChangePhoto={hasRecentPhotos ? handleOpenBottomSheet : openFilePicker}
              />
            ) : (
              <UploadPrompt onClick={openFilePicker} />
            )}

            <UploadsHistorySheet
              onClickButton={openFilePicker}
              onImageSelect={handleChoosePhotoFromHistory}
            />
          </>
        )}
      </FilePicker>

      <TryOnButton onClick={startTryOn} hidden={!showTryOnButton}>
        {tryOn}
      </TryOnButton>
    </main>
  )
}
