import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { motion, easeInOut } from 'framer-motion'

// redux
import { useAppSelector, useAppDispatch } from '@/store/store'

// actions
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { configSlice } from '@/store/slices/configSlice'

// selectors
import { isOpenSwipSelector, isShowFooterSelector } from '@/store/slices/configSlice/selectors'
import { currentImageSelector } from '@/store/slices/uploadsSlice/selectors'
import { isGeneratingSelector } from '@/store/slices/generationsSlice/selectors'

// components
import { Swip, ErrorSnackbar, Section, TryOnButton, SelectableImage } from '@/components'
import { AbortModal, ImageManager } from '@/components'

// hooks
import { useTryOnGeneration, usePhotoGallery, useImageUpload } from '@/hooks'

// types
import { InputImage } from '@/utils/api/tryOnApiService'

// styles
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

  const isOpenSwip = useAppSelector(isOpenSwipSelector)
  const isShowFooter = useAppSelector(isShowFooterSelector)
  const uploadedViewFile = useAppSelector(currentImageSelector)
  const isStartGeneration = useAppSelector(isGeneratingSelector)

  const { recentlyPhotos, removePhotoFromGallery } = usePhotoGallery()

  const { uploadImage } = useImageUpload()

  const { generatedImageUrl, isOpenAbortedModal, startTryOn, regenerate, closeAbortedModal } =
    useTryOnGeneration()

  const [recentImage, setRecentImage] = useState<InputImage | null>(null)

  const handleOpenSwip = () => {
    dispatch(configSlice.actions.setIsOpenSwip(true))
  }

  const handleChooseNewPhoto = (id: string, url: string) => {
    setTimeout(() => {
      dispatch(generationsSlice.actions.setIsGenerating(true))
      dispatch(uploadsSlice.actions.setCurrentImage({ id, url }))
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
        if (isOpenSwip) dispatch(configSlice.actions.setIsOpenSwip(false))
      })
    }
  }

  const hasInputImage = uploadedViewFile.localUrl.length > 0
  const hasRecentPhotos = recentlyPhotos && recentlyPhotos.length > 0
  const showTryOnButton = !isStartGeneration && (hasInputImage || recentImage)

  useEffect(() => {
    if (!hasInputImage && hasRecentPhotos) {
      setRecentImage(recentlyPhotos[0])
      dispatch(configSlice.actions.setIsShowFooter(true))
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
