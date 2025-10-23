import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { isAbortedSelector, abortReasonSelector, tryOnSlice } from '@/store/slices/tryOnSlice'
import { SecondaryButton } from '@/components'
import { useTryOnStrings } from '@/hooks'
import type { AbortReason } from '@/utils/api/tryOnApiService'
import styles from './AbortAlert.module.scss'

export const AbortAlert = () => {
  const dispatch = useAppDispatch()
  const isAborted = useAppSelector(isAbortedSelector)
  const abortReason = useAppSelector(abortReasonSelector)

  const {
    invalidInputImageDescription,
    invalidInputImageChangePhotoButton,
    noPeopleDetectedDescription,
    tooManyPeopleDetectedDescription,
    childDetectedDescription,
  } = useTryOnStrings()

  const handleClose = () => {
    dispatch(tryOnSlice.actions.setIsAborted(false))
  }

  if (!isAborted) return null

  // Select message based on abort_reason
  const getAbortMessage = (reason: AbortReason | null): string => {
    switch (reason) {
      case 'NO_PEOPLE_DETECTED':
        return noPeopleDetectedDescription
      case 'TOO_MANY_PEOPLE_DETECTED':
        return tooManyPeopleDetectedDescription
      case 'CHILD_DETECTED':
        return childDetectedDescription
      default:
        return invalidInputImageDescription
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.abortAlert}>
          <p className={styles.message}>{getAbortMessage(abortReason)}</p>
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
