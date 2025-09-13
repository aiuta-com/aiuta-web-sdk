import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { motion, easeInOut } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { appSlice } from '@/store/slices/appSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import { hasFooterSelector } from '@/store/slices/appSlice'
import {
  currentTryOnImageSelector,
  isGeneratingSelector,
  generatedImageUrlSelector,
  isAbortedSelector,
} from '@/store/slices/tryOnSlice'
import { Swip, ErrorSnackbar, Section, TryOnButton, SelectableImage } from '@/components'
import { AbortModal, ImageManager } from '@/components'
import { useTryOnGeneration, usePhotoGallery, useImageUpload } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import styles from './tryOn.module.scss'

const initiallAnimationConfig = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
  transition: {
    duration: 0.3,
    ease: easeInOut,
  },
}

export default function TryOnMobile() {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOpenSwip = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const isShowFooter = useAppSelector(hasFooterSelector)
  const uploadedViewFile = useAppSelector(currentTryOnImageSelector)
  const isStartGeneration = useAppSelector(isGeneratingSelector)
  const generatedImageUrl = useAppSelector(generatedImageUrlSelector)
  const isOpenAbortedModal = useAppSelector(isAbortedSelector)

  const { recentlyPhotos, removePhotoFromGallery } = usePhotoGallery()

  const { uploadImage } = useImageUpload()

  const { startTryOn, regenerate, closeAbortedModal } = useTryOnGeneration()

  const [recentImage, setRecentImage] = useState<InputImage | null>(null)

  const handleOpenSwip = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(true))
  }

  const handleChooseNewPhoto = (id: string, url: string) => {
    setTimeout(() => {
      dispatch(tryOnSlice.actions.setIsGenerating(true))
      dispatch(tryOnSlice.actions.setCurrentImage({ id, url, localUrl: url }))
      startTryOn({ id, url })
    }, 300)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.files) {
      const file = event.target.files[0]
      if (!file) return

      await uploadImage(file, (result: InputImage) => {
        startTryOn(result)
        if (isOpenSwip) dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
      })
    }
  }

  const hasInputImage = uploadedViewFile.localUrl.length > 0
  const hasRecentPhotos = recentlyPhotos && recentlyPhotos.length > 0
  const showTryOnButton = !isStartGeneration && (hasInputImage || recentImage)

  useEffect(() => {
    if (!hasInputImage && hasRecentPhotos) {
      setRecentImage(recentlyPhotos[0])
      dispatch(appSlice.actions.setHasFooter(true))
    }
  }, [recentlyPhotos, hasInputImage, dispatch, hasRecentPhotos])

  return (
    <>
      <Section
        className={`${styles.sectionMobile} ${!isShowFooter ? styles.sectionMobileActive : ''}`}
      >
        <motion.div
          key="tryon-mobile"
          className={styles.tryOnContainerMobile}
          {...initiallAnimationConfig}
        >
          <AbortModal isOpen={isOpenAbortedModal} onClose={closeAbortedModal} />
          <ErrorSnackbar onRetry={regenerate} />
          <div />

          <div className={styles.tryOnContentMobile}>
            <ImageManager
              uploadedImage={hasInputImage ? uploadedViewFile : undefined}
              recentImage={recentImage || undefined}
              isStartGeneration={isStartGeneration}
              generatedImageUrl={generatedImageUrl}
              onChangeImage={hasInputImage ? handleButtonClick : handleOpenSwip}
              onUploadClick={handleButtonClick}
            />
          </div>

          {showTryOnButton && (
            <TryOnButton isShowTryOnIcon onClick={() => startTryOn()}>
              Try On
            </TryOnButton>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChoosePhoto}
            style={{ display: 'none' }}
          />

          <Swip onClickButton={handleButtonClick} buttonText="+ Upload new photo">
            <div className={styles.imageContent}>
              {recentlyPhotos.length > 0
                ? recentlyPhotos.map((item: InputImage, index: number) => (
                    <SelectableImage
                      key={index}
                      src={item.url}
                      imageId={item.id}
                      variant="previously"
                      isShowTrashIcon={true}
                      classNames={styles.previouslyImageBox}
                      onDelete={removePhotoFromGallery}
                      onClick={() => handleChooseNewPhoto(item.id, item.url)}
                    />
                  ))
                : null}
            </div>
          </Swip>
        </motion.div>
      </Section>
    </>
  )
}
