import React from 'react'
import { SecondaryButton } from '@/components'
import type { AbortAlertProps } from './types'
import styles from './AbortAlert.module.scss'

export const AbortAlert = ({
  isOpen,
  onClose,
  message = "We couldn't detect anyone in this photo",
  buttonText = 'Change photo',
}: AbortAlertProps) => {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.abortAlert}>
          <p className={styles.message}>{message}</p>
          <SecondaryButton text={buttonText} onClick={onClose} classNames={styles.button} />
        </div>
      </div>
    </div>
  )
}
