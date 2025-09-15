import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { selectedImagesSelector } from '@/store/slices/generationsSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { SelectableImageProps } from './types'
import styles from './SelectableImage.module.scss'

export const SelectableImage = (props: SelectableImageProps) => {
  const { src, imageId, classNames, onClick } = props

  const dispatch = useAppDispatch()

  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const selectedImages = useAppSelector(selectedImagesSelector)
  const isSelectingGeneratedImages = useAppSelector(generationsIsSelectingSelector)

  const handleClick = useCallback(() => {
    onClick?.()

    if (isSelectingGeneratedImages) {
      // Update Redux store, not just local state
      if (isSelected) {
        // Remove from selection
        const updatedSelection = selectedImages.filter((id) => id !== imageId)
        dispatch(generationsSlice.actions.setSelectedImages(updatedSelection))
      } else {
        // Add to selection
        dispatch(generationsSlice.actions.setSelectedImages([...selectedImages, imageId]))
      }
    }
  }, [onClick, isSelectingGeneratedImages, isSelected, selectedImages, imageId, dispatch])

  useEffect(() => {
    // Sync local state with Redux store
    setIsSelected(selectedImages.includes(imageId))
  }, [selectedImages, imageId])

  useEffect(() => {
    setIsHovered(isSelectingGeneratedImages)
    if (!isSelectingGeneratedImages) {
      dispatch(generationsSlice.actions.clearSelectedImages())
    }
  }, [isSelectingGeneratedImages, dispatch])

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
