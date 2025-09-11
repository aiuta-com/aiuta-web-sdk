import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { motion, easeInOut } from 'framer-motion'

// redux
import { useAppSelector, useAppDispatch } from '@/store/store'

// actions
import { fileSlice } from '@/store/slices/fileSlice'
import { configSlice } from '@/store/slices/configSlice'
import { generateSlice } from '@/store/slices/generateSlice'

// selectors
import { isOpenSwipSelector, isShowFooterSelector } from '@/store/slices/configSlice/selectors'
import { uploadedViewFileSelector } from '@/store/slices/fileSlice/selectors'
import { isStartGenerationSelector } from '@/store/slices/generateSlice/selectors'

// components
import { Swip, ErrorSnackbar, Section, TryOnButton, SelectableImage } from '@/components'
import { AbortModal, ImageManager } from '@/components'

// hooks
import { useTryOnGeneration, usePhotoGallery, useImageUpload } from '@/hooks'

// types
import { UploadedImage } from '@/utils/api/tryOnApiService'

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
  const uploadedViewFile = useAppSelector(uploadedViewFileSelector)
  const isStartGeneration = useAppSelector(isStartGenerationSelector)

  const { recentlyPhotos, removePhotoFromGallery } = usePhotoGallery()

  const { uploadImage } = useImageUpload()

  const { generatedImageUrl, isOpenAbortedModal, startTryOn, regenerate, closeAbortedModal } =
    useTryOnGeneration()

  const [recentImage, setRecentImage] = useState<UploadedImage | null>(null)

  const handleOpenSwip = () => {
    dispatch(configSlice.actions.setIsOpenSwip(true))
  }

  const handleChooseNewPhoto = (id: string, url: string) => {
    setTimeout(() => {
      dispatch(generateSlice.actions.setIsStartGeneration(true))
      dispatch(fileSlice.actions.setUploadViewFile({ id, url }))
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

      await uploadImage(file, (result: UploadedImage) => {
        startTryOn(result)
        if (isOpenSwip) dispatch(configSlice.actions.setIsOpenSwip(false))
      })
    }
  }

  const hasUploadedImage = uploadedViewFile.localUrl.length > 0
  const hasRecentPhotos = recentlyPhotos && recentlyPhotos.length > 0
  const showTryOnButton = !isStartGeneration && (hasUploadedImage || recentImage)

  useEffect(() => {
    if (!hasUploadedImage && hasRecentPhotos) {
      setRecentImage(recentlyPhotos[0])
      dispatch(configSlice.actions.setIsShowFooter(true))
    }
  }, [recentlyPhotos, hasUploadedImage, dispatch, hasRecentPhotos])

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
              uploadedImage={hasUploadedImage ? uploadedViewFile : undefined}
              recentImage={recentImage || undefined}
              isStartGeneration={isStartGeneration}
              generatedImageUrl={generatedImageUrl}
              onChangeImage={hasUploadedImage ? handleButtonClick : handleOpenSwip}
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
                ? recentlyPhotos.map((item: UploadedImage, index: number) => (
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
