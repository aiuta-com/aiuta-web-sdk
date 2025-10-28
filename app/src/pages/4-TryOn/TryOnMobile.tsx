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
  TryOnView,
} from '@/components'
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
  const { startTryOn, retryTryOn } = useTryOnGeneration()
  const { tryOn } = useTryOnStrings()

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (isBottomSheetOpen) {
        dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      }
      const newImage = await selectImageToTryOn(file)
      startTryOn(newImage)
    },
    [isBottomSheetOpen, dispatch, selectImageToTryOn, startTryOn],
  )

  const handleOpenBottomSheet = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
  }

  const handleChoosePhotoFromHistory = useCallback(
    (id: string, url: string) => {
      const imageToTryOn = { id, url }
      dispatch(tryOnSlice.actions.setSelectedImage(imageToTryOn))
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      startTryOn(imageToTryOn)
    },
    [dispatch, startTryOn],
  )

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
      <ErrorSnackbar onRetry={retryTryOn} />

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

      <TryOnButton onClick={() => startTryOn()} hidden={!showTryOnButton}>
        {tryOn}
      </TryOnButton>
    </main>
  )
}
