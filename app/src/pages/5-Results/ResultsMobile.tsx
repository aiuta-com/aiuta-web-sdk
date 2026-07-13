import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { galleryModalSlice } from '@/store/slices/galleryModalSlice'
import {
  Flex,
  RemoteImage,
  Icon,
  IconButton,
  Disclaimer,
  Feedback,
  OtherPhoto,
  UploadsHistorySheet,
  FilePicker,
  PoweredBy,
  ConsentPopup,
  PrimaryButton,
} from '@/components'
import { icons as actionIcons } from '@/components/results/ResultActions/icons'
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
  useSizeFitStrings,
  useSizeFitEntry,
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

  const { currentImage, images } = useResultsGallery()
  const { shareImage } = useNavigatorShare()
  const { isEnabled: isOtherPhotoEnabled } = useTryOnWithOtherPhoto()
  const { startTryOn } = useTryOnGeneration()
  const { selectImageToTryOn } = useTryOnImage()
  const { isEnabled: isModelsEnabled } = usePredefinedModels()
  const { recentlyPhotos } = useUploadsGallery()
  const { isConsentOpen, runWithConsent, closeConsent, confirmConsent } = useConsentGate()
  const { sizeFitButton } = useSizeFitStrings()
  const { isAvailable: isSizeFitAvailable, open: openSizeFit } = useSizeFitEntry()

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

  // Open the fullscreen viewer on the generations history at the current
  // result, so it can be swiped through (same data/flow as desktop).
  const openFullScreen = useCallback(() => {
    if (!currentImage) return
    dispatch(
      galleryModalSlice.actions.openGalleryModal({
        images: images.map(({ id, url }) => ({ id, url })),
        activeId: currentImage.id,
        modalType: 'generations',
      }),
    )
  }, [currentImage, images, dispatch])

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
                  onClick={openFullScreen}
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
                {/* A product with a size chart gets its CTA in the reserved
                  cart-button space; the Powered by footer yields to it so the
                  reserve (and the result image above) keeps its height */}
                {isSizeFitAvailable ? (
                  <PrimaryButton onClick={openSizeFit} className={styles.sizeFitButton}>
                    <Icon icon={actionIcons.sizeFit} size={20} viewBox="0 0 20 20" />
                    {sizeFitButton}
                  </PrimaryButton>
                ) : (
                  <PoweredBy />
                )}
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

      <ConsentPopup isOpen={isConsentOpen} onClose={closeConsent} onConfirm={confirmConsent} />
    </main>
  )
}
