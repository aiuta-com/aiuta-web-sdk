import React, { useState, MouseEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/store'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { ViewImageTypes } from './types'
import styles from './viewImage.module.scss'

export const ViewImage = (props: ViewImageTypes) => {
  const {
    url,
    className,
    generatedImageUrl,
    isStartGeneration,
    isShowChangeImageBtn,
    onChange,
    onClick,
  } = props

  const dispatch = useAppDispatch()

  const [generatingText, setGeneratingText] = useState('Scanning your body')

  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate(`/${path}`)
  }

  const handleOnChange = () => {
    if (typeof onChange === 'function') return onChange()
    handleNavigate('previously')

    dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())
  }

  const handleClickOnImage = (event: MouseEvent<HTMLImageElement>) => {
    if (typeof onClick === 'function') onClick(event)
  }

  useEffect(() => {
    if (isStartGeneration) {
      setTimeout(() => {
        setGeneratingText('Generating outfit')
      }, 2000)
    }
  }, [isStartGeneration])

  return (
    <div
      className={`
        ${styles.viewImageBox}
        ${isStartGeneration ? styles.startGeneration : ''}
        ${generatedImageUrl ? styles.startShowGeneratedImage : ''}
        ${className ?? ''}
       `}
    >
      {isShowChangeImageBtn && (
        <button className={styles.changeImageBtn} onClick={handleOnChange}>
          Change photo
        </button>
      )}

      <div className={styles.tryOnButtonSecondary}>
        <div className={styles.tryOnBtnSpinner}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className={styles.loadingBox}>
              <span className={styles.tryOnHidden}>Loading...</span>
            </div>
          ))}
        </div>
        <span>{generatingText}</span>
      </div>

      {generatedImageUrl && (
        <img
          width={280}
          height={460}
          loading="lazy"
          alt="View image"
          src={generatedImageUrl}
          className={styles.newGeneratedImage}
          onClick={handleClickOnImage}
        />
      )}

      <img
        src={url}
        width={280}
        height={460}
        loading="lazy"
        alt="View image"
        className={styles.tryOnImage}
        onClick={handleClickOnImage}
      />
    </div>
  )
}
