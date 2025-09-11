import React from 'react'
import { AiutaModal } from '@/components/shared/modals'
import { SecondaryButton } from '@/components/feature'
import styles from './AbortModal.module.scss'

interface AbortModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  buttonText?: string
}

export const AbortModal: React.FC<AbortModalProps> = ({
  isOpen,
  onClose,
  message = "We couldn't detect anyone in this photo",
  buttonText = 'Change photo',
}) => {
  return (
    <AiutaModal isOpen={isOpen}>
      <div className={styles.abortModal}>
        <p>{message}</p>
        <SecondaryButton text={buttonText} onClick={onClose} classNames={styles.actionButton} />
      </div>
    </AiutaModal>
  )
}
