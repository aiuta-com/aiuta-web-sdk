import React from 'react'
import { SecondaryButton } from '@/components'
import { useTryOnStrings } from '@/hooks'
import type { AbortAlertProps } from './types'
import styles from './AbortAlert.module.scss'

export const AbortAlert = ({ isOpen, onClose }: AbortAlertProps) => {
  const { invalidInputImageDescription, invalidInputImageChangePhotoButton } = useTryOnStrings()

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.abortAlert}>
          <p className={styles.message}>{invalidInputImageDescription}</p>
          <SecondaryButton
            text={invalidInputImageChangePhotoButton}
            onClick={onClose}
            classNames={styles.button}
          />
        </div>
      </div>
    </div>
  )
}
