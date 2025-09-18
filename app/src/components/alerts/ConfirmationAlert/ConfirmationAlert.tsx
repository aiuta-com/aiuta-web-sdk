import React from 'react'
import { SecondaryButton } from '@/components'
import { ConfirmationAlertProps } from './types'
import styles from './ConfirmationAlert.module.scss'

export const ConfirmationAlert = ({
  isVisible,
  message,
  leftButtonText,
  rightButtonText,
  onLeftClick,
  onRightClick,
}: ConfirmationAlertProps) => {
  if (!isVisible) return null

  return (
    <div className={styles.confirmationAlert}>
      <div className={styles.modalContent}>
        <h3 className={styles.text}>{message}</h3>
        <div className={styles.buttonsLine}>
          <SecondaryButton text={leftButtonText} onClick={onLeftClick} />
          <SecondaryButton text={rightButtonText} onClick={onRightClick} />
        </div>
      </div>
    </div>
  )
}
