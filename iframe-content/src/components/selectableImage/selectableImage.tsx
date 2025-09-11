import React, { useState, useEffect } from 'react'

// redux
import { useAppSelector, useAppDispatch } from '@/store/store'

// actions
import { generateSlice } from '@/store/slices/generateSlice'

// selectors
import { selectedImagesSelector } from '@/store/slices/generateSlice/selectors'
import {
  isSelectHistoryImagesSelector,
  isSelectPreviouselyImagesSelector,
} from '@/store/slices/configSlice/selectors'

// components
import { SecondaryButton } from '@/components/secondaryButton/secondaryButton'
import { CountDownAnimation } from '@/components/CountDownAnimation/countDownAnimation'

// types
import { SelectableImageTypes } from './types'

// styles
import styles from './selectableImage.module.scss'

export const SelectableImage = (props: SelectableImageTypes) => {
  const { src, imageId, variant, classNames, isShowTrashIcon, onClick, onDelete } = props

  const dispatch = useAppDispatch()

  const [isSelect, setIsSelect] = useState<boolean>(false)
  const [isActiveHover, setIsActiveHover] = useState<boolean>(false)
  const [isStartCountdown, setIsStartCountDown] = useState<boolean>(false)

  const selectedImages = useAppSelector(selectedImagesSelector)
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector)
  const isSelectPreviouselyImages = useAppSelector(isSelectPreviouselyImagesSelector)

  const handleClick = () => {
    if (typeof onClick === 'function') onClick()

    if (isSelectHistoryImages) {
      setIsSelect((prevState) => !prevState)
    }
  }

  const handleToggleCountDown = () => {
    setIsStartCountDown((prevState) => !prevState)
  }

  const handleRejectDeleteProcess = () => setIsStartCountDown(false)

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(imageId)
      handleToggleCountDown()
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
      dispatch(generateSlice.actions.setSelectedImage([]))
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
            handleToggleCountDown()
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
            handleToggleCountDown()
          }}
        >
          <img src={'./icons/redTrash.svg'} alt="Red Trash" width={18} height={19} />
        </div>
      )}
      {isSelectPreviouselyImages && isStartCountdown && (
        <div
          className={`${styles.countDownContent} ${
            isShowTrashIcon ? styles.countDownContentCentered : ''
          }`}
        >
          <CountDownAnimation timer={5} onClick={handleDelete} />
          <p className={styles.countDownInfo}>Photo will be deleted soon</p>
          <SecondaryButton
            text="Cancel"
            classNames={styles.countDownBtn}
            onClick={(e) => {
              e.stopPropagation()
              handleRejectDeleteProcess()
            }}
          />
        </div>
      )}
      <img src={src} width={115} height={180} loading="lazy" alt="Selectable image" />
    </div>
  )
}
