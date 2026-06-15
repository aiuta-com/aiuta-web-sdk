import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import {
  selectedImageSelector,
  isGeneratingSelector,
  productIdsSelector,
} from '@/store/slices/tryOnSlice'
import {
  UploadsHistorySheet,
  ErrorSnackbar,
  TryOnButton,
  TryOnStatus,
  SecondaryButton,
  UploadPrompt,
  FilePicker,
  TryOnView,
} from '@/components'
import {
  useTryOnGeneration,
  useTryOnImage,
  useUploadsGallery,
  useTryOnStrings,
  useImagePickerStrings,
  usePredefinedModels,
} from '@/hooks'
import { useRpc } from '@/contexts'
import styles from './TryOn.module.scss'

export default function TryOnMobile() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const rpc = useRpc()

  const selectedImage = useAppSelector(selectedImageSelector)
  const isGenerating = useAppSelector(isGeneratingSelector)
  const productIds = useAppSelector(productIdsSelector)

  const { recentlyPhotos: recentPhotos } = useUploadsGallery()
  const { selectImageToTryOn } = useTryOnImage()
  const { startTryOn, retryTryOn } = useTryOnGeneration()
  const { tryOn } = useTryOnStrings()
  const { uploadsHistoryButtonChangePhoto } = useImagePickerStrings()
  const { isEnabled: isModelsEnabled } = usePredefinedModels()

  const handleFileSelect = useCallback(
    async (file: File) => {
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      const newImage = await selectImageToTryOn(file)
      startTryOn(newImage)
    },
    [dispatch, selectImageToTryOn, startTryOn],
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

  const handleModelsClick = useCallback(() => {
    navigate('/models')
  }, [navigate])

  const hasRecentPhotos = recentPhotos && recentPhotos.length > 0

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'imagePicker',
      productIds,
    })
  }, [rpc, productIds])

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
              <>
                {/* Full-bleed image with the loading veil (same as desktop);
                    the change-photo action moves to the button row below */}
                <TryOnView image={selectedImage} isGenerating={isGenerating} fill />

                {isGenerating ? (
                  // The status takes the action row's place so the layout
                  // doesn't jump when the generation starts
                  <div className={styles.loadingRow}>
                    <TryOnStatus />
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <SecondaryButton
                      onClick={hasRecentPhotos ? handleOpenBottomSheet : openFilePicker}
                      shape="M"
                      classNames={styles.action}
                    >
                      {uploadsHistoryButtonChangePhoto}
                    </SecondaryButton>
                    <TryOnButton onClick={() => startTryOn()} className={styles.action}>
                      {tryOn}
                    </TryOnButton>
                  </div>
                )}
              </>
            ) : (
              <UploadPrompt
                onClick={openFilePicker}
                onModelsClick={isModelsEnabled ? handleModelsClick : undefined}
              />
            )}

            <UploadsHistorySheet
              onUploadNew={openFilePicker}
              onImageSelect={handleChoosePhotoFromHistory}
              onSelectModel={isModelsEnabled ? handleModelsClick : undefined}
            />
          </>
        )}
      </FilePicker>
    </main>
  )
}
