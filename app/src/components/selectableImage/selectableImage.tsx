import React, { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { selectedImagesSelector } from '@/store/slices/generationsSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { uploadsIsSelectingSelector } from '@/store/slices/uploadsSlice'
import { SelectableImageTypes } from './types'
import styles from './selectableImage.module.scss'

export const SelectableImage = (props: SelectableImageTypes) => {
  const { src, imageId, variant, classNames, isShowTrashIcon, onClick, onDelete } = props

  const dispatch = useAppDispatch()

  const [isSelect, setIsSelect] = useState<boolean>(false)
  const [isActiveHover, setIsActiveHover] = useState<boolean>(false)

  const selectedImages = useAppSelector(selectedImagesSelector)
  const isSelectHistoryImages = useAppSelector(generationsIsSelectingSelector)
  const isSelectPreviouselyImages = useAppSelector(uploadsIsSelectingSelector)

  const handleClick = () => {
    if (typeof onClick === 'function') onClick()

    if (isSelectHistoryImages) {
      setIsSelect((prevState) => !prevState)
    }
  }

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(imageId)
    }
  }

  useEffect(() => {
    if (selectedImages.length > 0) {
      for (const id of selectedImages) {
        if (id === imageId) {
          setIsSelect(true)
        }
      }
    } else {
      setIsSelect(false)
    }
  }, [selectedImages])

  useEffect(() => {
    if (isSelectHistoryImages) setIsActiveHover(isSelectHistoryImages)
    else {
      setIsActiveHover(isSelectHistoryImages)
      dispatch(generationsSlice.actions.clearSelectedImages())
    }
  }, [isSelectHistoryImages])

  const isHistory = variant === 'history'
  const isPreviously = variant === 'previously'

  return (
    <div
      className={`${styles.selectableImage}
      ${isHistory ? styles.selectableImagehistory : ''}
      ${isHistory && isSelect ? styles.selectableImageActive : ''}
      ${classNames ?? ''}
      `}
      onClick={handleClick}
    >
      {isHistory && (isSelect || (isActiveHover && !isSelect)) && (
        <div className={styles.checkmark} />
      )}
      {isSelectPreviouselyImages && isPreviously && !isShowTrashIcon && (
        <div
          className={styles.deleteimage}
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <span />
          <span />
        </div>
      )}
      {isSelectPreviouselyImages && isShowTrashIcon && (
        <div
          className={styles.previouslyTrashIcon}
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <img src={'./icons/redTrash.svg'} alt="Red Trash" width={18} height={19} />
        </div>
      )}
      <img src={src} width={115} height={180} loading="lazy" alt="Selectable image" />
    </div>
  )
}
