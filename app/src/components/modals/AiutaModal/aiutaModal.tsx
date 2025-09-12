import React from 'react'
import { AiutaModalTypes } from './types'
import styles from './aiutaModal.module.scss'

export const AiutaModal = (props: AiutaModalTypes) => {
  const { children, isOpen } = props

  return (
    <div className={`${styles.aiutaModal} ${isOpen ? styles.aiutaModalActive : ''}`}>
      <div className={styles.moadlContent}>{children}</div>
    </div>
  )
}
