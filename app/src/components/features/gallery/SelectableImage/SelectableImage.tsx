import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { selectedImagesSelector } from '@/store/slices/generationsSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { selectedUploadsSelector, uploadsIsSelectingSelector } from '@/store/slices/uploadsSlice'
import { SelectableImageProps } from './types'
import styles from './SelectableImage.module.scss'

export const SelectableImage = (props: SelectableImageProps) => {
  const { src, imageId, classNames, onClick, galleryType = 'generations' } = props

  const dispatch = useAppDispatch()

  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  // Select appropriate selectors based on gallery type
  const generationsSelectedImages = useAppSelector(selectedImagesSelector)
  const uploadsSelectedImages = useAppSelector(selectedUploadsSelector)
  const isSelectingGeneratedImages = useAppSelector(generationsIsSelectingSelector)
  const isSelectingUploadsImages = useAppSelector(uploadsIsSelectingSelector)

  // Get current gallery data
  const selectedImages =
    galleryType === 'uploads' ? uploadsSelectedImages : generationsSelectedImages
  const isSelecting =
    galleryType === 'uploads' ? isSelectingUploadsImages : isSelectingGeneratedImages

  const handleClick = useCallback(() => {
    onClick?.()

    if (isSelecting) {
      // Update Redux store based on gallery type
      if (isSelected) {
        // Remove from selection
        const updatedSelection = selectedImages.filter((id) => id !== imageId)
        if (galleryType === 'uploads') {
          dispatch(uploadsSlice.actions.setSelectedImages(updatedSelection))
        } else {
          dispatch(generationsSlice.actions.setSelectedImages(updatedSelection))
        }
      } else {
        // Add to selection
        const updatedSelection = [...selectedImages, imageId]
        if (galleryType === 'uploads') {
          dispatch(uploadsSlice.actions.setSelectedImages(updatedSelection))
        } else {
          dispatch(generationsSlice.actions.setSelectedImages(updatedSelection))
        }
      }
    }
  }, [onClick, isSelecting, isSelected, selectedImages, imageId, galleryType, dispatch])

  useEffect(() => {
    // Sync local state with Redux store
    setIsSelected(selectedImages.includes(imageId))
  }, [selectedImages, imageId])

  useEffect(() => {
    setIsHovered(isSelecting)
    if (!isSelecting) {
      // Clear selection when exiting selection mode
      if (galleryType === 'uploads') {
        dispatch(uploadsSlice.actions.clearSelectedImages())
      } else {
        dispatch(generationsSlice.actions.clearSelectedImages())
      }
    }
  }, [isSelecting, galleryType, dispatch])

  const isCheckmarkVisible = useMemo(
    () => isSelected || (isHovered && !isSelected),
    [isSelected, isHovered],
  )

  // CSS classes computation
  const containerClasses = useMemo(
    () =>
      [styles.selectableImage, isSelected ? styles.selectableImageActive : '', classNames || '']
        .filter(Boolean)
        .join(' '),
    [isSelected, classNames],
  )

  return (
    <div className={containerClasses} onClick={handleClick}>
      {isCheckmarkVisible && <div className={styles.checkmark} />}
      <img src={src} width={115} height={180} loading="lazy" alt="Selectable image" />
    </div>
  )
}
