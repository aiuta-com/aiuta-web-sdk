import React from 'react'
import { PrimaryButton } from '@/components'
import { useTryOnStrings, useAbortAlert } from '@/hooks'
import { combineClassNames } from '@/utils'
import type { AbortReason } from '@/utils/api/tryOnApiService'
import styles from './AbortAlert.module.scss'

export const AbortAlert = () => {
  const { abortReason, animationState, showContent, isVisible, closeAlert } = useAbortAlert()

  const {
    invalidInputImageDescription,
    invalidInputImageChangePhotoButton,
    noPeopleDetectedDescription,
    tooManyPeopleDetectedDescription,
    childDetectedDescription,
  } = useTryOnStrings()

  if (!isVisible) return null

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
    <div className={combineClassNames(styles.abortAlert, styles[`abortAlert_${animationState}`])}>
      {showContent && (
        <div className={combineClassNames('aiuta-modal', styles.modal)}>
          <p className={combineClassNames('aiuta-label-regular', styles.message)}>
            {getAbortMessage(abortReason)}
          </p>
          <PrimaryButton onClick={closeAlert} shape="S">
            {invalidInputImageChangePhotoButton}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
