import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { isAbortedSelector, tryOnSlice } from '@/store/slices/tryOnSlice'
import { SecondaryButton } from '@/components'
import { useTryOnStrings } from '@/hooks'
import styles from './AbortAlert.module.scss'

export const AbortAlert = () => {
  const dispatch = useAppDispatch()
  const isAborted = useAppSelector(isAbortedSelector)
  const { invalidInputImageDescription, invalidInputImageChangePhotoButton } = useTryOnStrings()

  const handleClose = () => {
    dispatch(tryOnSlice.actions.setIsAborted(false))
  }

  if (!isAborted) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.abortAlert}>
          <p className={styles.message}>{invalidInputImageDescription}</p>
          <SecondaryButton
            text={invalidInputImageChangePhotoButton}
            onClick={handleClose}
            classNames={styles.button}
          />
        </div>
      </div>
    </div>
  )
}
