import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { selectedImagesSelector } from '@/store/slices/generationsSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { selectedUploadsSelector, uploadsIsSelectingSelector } from '@/store/slices/uploadsSlice'
import { combineClassNames } from '@/utils'
import { Icon, RemoteImage } from '@/components'
import { SelectableImageProps } from './types'
import styles from './SelectableImage.module.scss'

export const SelectableImage = (props: SelectableImageProps) => {
  const { src, imageId, classNames, onClick, galleryType = 'generations' } = props

  const dispatch = useAppDispatch()

  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  // Select appropriate selectors based on gallery type
  const selectedImages = useAppSelector(
    galleryType === 'uploads' ? selectedUploadsSelector : selectedImagesSelector,
  )
  const isSelecting = useAppSelector(
    galleryType === 'uploads' ? uploadsIsSelectingSelector : generationsIsSelectingSelector,
  )

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
      combineClassNames(
        styles.selectableImage,
        isSelected && styles.selectableImage_selected,
        classNames,
      ),
    [isSelected, classNames],
  )

  return (
    <div className={containerClasses} onClick={handleClick}>
      {isCheckmarkVisible && (
        <div className={styles.checkmark}>
          <Icon
            icon="<path d='M1 5.5L5 9L11 1.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
            size={12}
            viewBox="0 0 12 10"
            className={styles.checkmarkIcon}
          />
        </div>
      )}
      <RemoteImage src={src} alt="Image" shape="M" loading="lazy" />
    </div>
  )
}
