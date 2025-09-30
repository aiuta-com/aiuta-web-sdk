import React from 'react'
import { SecondaryButton } from '@/components'
import { ConfirmationProps } from './types'
import styles from './Confirmation.module.scss'

export const Confirmation = ({
  isVisible,
  message,
  leftButtonText,
  rightButtonText,
  onLeftClick,
  onRightClick,
}: ConfirmationProps) => {
  if (!isVisible) return null

  return (
    <div className={styles.confirmation}>
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
