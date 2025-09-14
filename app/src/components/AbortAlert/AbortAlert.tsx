import React from 'react'
import { AiutaModal } from '@/components'
import { SecondaryButton } from '@/components'
import type { AbortAlertProps } from './types'
import styles from './AbortAlert.module.scss'

export const AbortAlert = ({
  isOpen,
  onClose,
  message = "We couldn't detect anyone in this photo",
  buttonText = 'Change photo',
}: AbortAlertProps) => {
  return (
    <AiutaModal isOpen={isOpen}>
      <div className={styles.abortAlert}>
        <p className={styles.message}>{message}</p>
        <SecondaryButton text={buttonText} onClick={onClose} classNames={styles.button} />
      </div>
    </AiutaModal>
  )
}
