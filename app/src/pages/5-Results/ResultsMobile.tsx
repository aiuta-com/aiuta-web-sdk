import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import {
  Flex,
  RemoteImage,
  IconButton,
  Disclaimer,
  Feedback,
  OtherPhoto,
  UploadsHistorySheet,
  FilePicker,
} from '@/components'
import {
  useResultsGallery,
  useNavigatorShare,
  useTryOnWithOtherPhoto,
  useTryOnGeneration,
  useTryOnImage,
  usePredefinedModels,
  useUploadsGallery,
} from '@/hooks'
import { combineClassNames } from '@/utils'
import { icons } from './icons'
import styles from './Results.module.scss'

/**
 * Mobile version of results page with share functionality and swipe navigation
 */
export default function ResultsMobile() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { currentImage } = useResultsGallery()
  const { shareImage, handleMobileImageClick } = useNavigatorShare()
  const { isEnabled: isOtherPhotoEnabled } = useTryOnWithOtherPhoto()
  const { startTryOn } = useTryOnGeneration()
  const { selectImageToTryOn } = useTryOnImage()
  const { isEnabled: isModelsEnabled } = usePredefinedModels()
  const { recentlyPhotos } = useUploadsGallery()

  const hasMultiplePhotos = recentlyPhotos.length > 1

  const handleFileSelect = useCallback(
    async (file: File) => {
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      const newImage = await selectImageToTryOn(file)
      navigate('/tryon')
      startTryOn(newImage)
    },
    [dispatch, navigate, selectImageToTryOn, startTryOn],
  )

  const handleChoosePhotoFromHistory = useCallback(
    (id: string, url: string) => {
      const imageToTryOn = { id, url }
      dispatch(tryOnSlice.actions.setSelectedImage(imageToTryOn))
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      navigate('/tryon')
      startTryOn(imageToTryOn)
    },
    [dispatch, navigate, startTryOn],
  )

  const handleModelsClick = useCallback(() => {
    navigate('/models')
  }, [navigate])

  return (
    <main className={styles.results}>
      <FilePicker onFileSelect={handleFileSelect}>
        {({ openFilePicker }) => (
          <>
            <Flex contentClassName={combineClassNames('aiuta-image-l')}>
              <RemoteImage
                src={currentImage}
                alt="Generated result"
                shape="L"
                onClick={() => currentImage && handleMobileImageClick(currentImage.url)}
              />
              <IconButton
                icon={icons.share}
                label="Share"
                onClick={() => currentImage && shareImage(currentImage.url)}
                className={styles.shareButton}
              />
              {isOtherPhotoEnabled && <OtherPhoto className={styles.otherPhoto} />}
              {currentImage && (
                <Feedback generatedImageUrl={currentImage.url} className={styles.feedback} />
              )}
            </Flex>
            <Disclaimer className={styles.disclaimer} />

            <UploadsHistorySheet
              onUploadNew={openFilePicker}
              onImageSelect={hasMultiplePhotos ? handleChoosePhotoFromHistory : undefined}
              onSelectModel={isModelsEnabled ? handleModelsClick : undefined}
            />
          </>
        )}
      </FilePicker>
    </main>
  )
}
