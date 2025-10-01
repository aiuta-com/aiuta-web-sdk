import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import { BottomSheet, PrimaryButton, DeletableImage } from '@/components'
import { useUploadsGallery, useImagePickerStrings } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import type { UploadsHistorySheetProps } from './types'
import styles from './UploadsHistorySheet.module.scss'

export const UploadsHistorySheet = ({ onClickButton, onImageSelect }: UploadsHistorySheetProps) => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const { uploadsHistoryTitle, uploadsHistoryButtonNewPhoto } = useImagePickerStrings()

  const { recentlyPhotos: recentPhotos, handleImageDelete: removePhotoFromGallery } =
    useUploadsGallery()

  const handleClose = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
  }

  const handleImageClick = (item: InputImage) => {
    onImageSelect(item.id, item.url)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className={styles.title}>
        <h2 className="aiuta-title-m">{uploadsHistoryTitle}</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.imageContent} data-scrollable="true">
          {recentPhotos.length > 0
            ? recentPhotos.map((item: InputImage, index) => (
                <DeletableImage
                  key={`${item.id}-${index}-${recentPhotos.length}`}
                  src={item.url}
                  imageId={item.id}
                  classNames={styles.imageBox}
                  onDelete={removePhotoFromGallery}
                  onClick={() => handleImageClick(item)}
                />
              ))
            : null}
        </div>
      </div>

      <PrimaryButton onClick={onClickButton}>{uploadsHistoryButtonNewPhoto}</PrimaryButton>
    </BottomSheet>
  )
}
