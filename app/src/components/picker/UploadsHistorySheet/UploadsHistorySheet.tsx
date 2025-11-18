import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import { BottomSheet, PrimaryButton, SecondaryButton, DeletableImage } from '@/components'
import { useUploadsGallery, useImagePickerStrings, usePredefinedModelsStrings } from '@/hooks'
import { InputImage } from '@/utils/api/tryOnApiService'
import type { UploadsHistorySheetProps } from './types'
import styles from './UploadsHistorySheet.module.scss'

export const UploadsHistorySheet = ({
  onUploadNew,
  onImageSelect,
  onSelectModel,
}: UploadsHistorySheetProps) => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector(uploadsIsBottomSheetOpenSelector)
  const { uploadsHistoryTitle, uploadsHistoryButtonNewPhoto } = useImagePickerStrings()
  const { predefinedModelsTitle } = usePredefinedModelsStrings()

  const { recentlyPhotos: recentPhotos, handleImageDelete: removePhotoFromGallery } =
    useUploadsGallery()

  // Auto-close when all photos are deleted
  useEffect(() => {
    if (isOpen && recentPhotos.length === 0) {
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
    }
  }, [isOpen, recentPhotos.length, dispatch])

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
  }

  const handleImageClick = (item: InputImage) => {
    if (onImageSelect) {
      onImageSelect(item.id, item.url)
    }
  }

  const handleImageDelete = (imageId: string) => {
    removePhotoFromGallery(imageId)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      {onImageSelect && (
        <>
          <div className={styles.title}>
            <h2 className="aiuta-title-m">{uploadsHistoryTitle}</h2>
          </div>

          <div className={styles.content} onClick={(e) => e.stopPropagation()}>
            <div
              className={styles.imageContent}
              data-scrollable="true"
              onClick={(e) => e.stopPropagation()}
            >
              {recentPhotos.length > 0
                ? recentPhotos.map((item: InputImage, index) => (
                    <DeletableImage
                      key={`${item.id}-${index}-${recentPhotos.length}`}
                      src={item.url}
                      imageId={item.id}
                      classNames={styles.imageBox}
                      onDelete={handleImageDelete}
                      onClick={() => handleImageClick(item)}
                    />
                  ))
                : null}
            </div>
          </div>
        </>
      )}

      <PrimaryButton onClick={onUploadNew}>{uploadsHistoryButtonNewPhoto}</PrimaryButton>

      {onSelectModel && (
        <SecondaryButton onClick={onSelectModel} shape="M" maxWidth={true}>
          {predefinedModelsTitle}
        </SecondaryButton>
      )}
    </BottomSheet>
  )
}
