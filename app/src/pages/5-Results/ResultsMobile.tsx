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
  useImageTone,
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

  // Tone of the image bottom → light/dark disclaimer strip (same as desktop)
  const toneInfo = useImageTone(currentImage?.url)

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
            <Flex
              containerClassName={styles.fillContainer}
              contentClassName={combineClassNames('aiuta-image-m', styles.fillContent)}
            >
              <RemoteImage
                src={currentImage}
                alt="Generated result"
                shape="M"
                fit="smart"
                onClick={() => currentImage && handleMobileImageClick(currentImage.url)}
              />
              <IconButton
                icon={icons.share}
                label="Share"
                onClick={() => currentImage && shareImage(currentImage.url)}
                className={styles.shareButton}
              />
              {isOtherPhotoEnabled && <OtherPhoto className={styles.changePhotoFab} />}
              {currentImage && (
                <Feedback generatedImageUrl={currentImage.url} className={styles.feedback} />
              )}
              {toneInfo && (
                <Disclaimer overlay tone={toneInfo.tone} tint={toneInfo.averageColor} />
              )}
            </Flex>

            {/* We don't render an Add to cart button, but reserve its space so
                the result image keeps the same height as the loading screen
                (which has the status row below the image) — no jump on finish */}
            <div className={styles.cartReserve} aria-hidden="true" />

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
