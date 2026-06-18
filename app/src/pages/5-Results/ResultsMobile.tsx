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
  PoweredBy,
  ConsentPopup,
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
  useConsentGate,
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
  const { isConsentOpen, runWithConsent, closeConsent, confirmConsent } = useConsentGate()

  // Tone of the image bottom → light/dark disclaimer strip (same as desktop)
  const toneInfo = useImageTone(currentImage?.url)

  const hasMultiplePhotos = recentlyPhotos.length > 1

  const handleFileSelect = useCallback(
    async (file: File) => {
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      const newImage = await selectImageToTryOn(file)
      // Replace: /tryon and the result that follows have no back button, so the
      // current results entry is consumed instead of stacked
      navigate('/tryon', { replace: true })
      startTryOn(newImage)
    },
    [dispatch, navigate, selectImageToTryOn, startTryOn],
  )

  const handleChoosePhotoFromHistory = useCallback(
    (id: string, url: string) => {
      const imageToTryOn = { id, url }
      dispatch(tryOnSlice.actions.setSelectedImage(imageToTryOn))
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      // Replace: see handleFileSelect — consume the results entry, don't stack
      navigate('/tryon', { replace: true })
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
        {({ openFilePicker }) => {
          const requestUpload = () => runWithConsent(openFilePicker)
          return (
          <>
            <Flex
              fill
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
            </Flex>

            {/* No Add to cart button yet, but its space is reserved so the
                result image keeps the same height as the loading screen (no
                jump on finish). It holds the fit disclaimer — flush under the
                photo, full-width, its background the photo's stretched bottom
                row — and the Powered by footer. Keeping the disclaimer inside
                this reserve (not as its own row) is what stops the image from
                shrinking. */}
            <div className={styles.cartReserve}>
              {toneInfo && (
                <Disclaimer
                  variant="strip"
                  tone={toneInfo.tone}
                  tint={toneInfo.averageColor}
                  stripUrl={toneInfo.stripUrl}
                />
              )}
              <PoweredBy />
            </div>

            <UploadsHistorySheet
              onUploadNew={requestUpload}
              onImageSelect={hasMultiplePhotos ? handleChoosePhotoFromHistory : undefined}
              onSelectModel={isModelsEnabled ? handleModelsClick : undefined}
            />
          </>
          )
        }}
      </FilePicker>

      <ConsentPopup
        isOpen={isConsentOpen}
        onClose={closeConsent}
        onConfirm={confirmConsent}
      />
    </main>
  )
}
