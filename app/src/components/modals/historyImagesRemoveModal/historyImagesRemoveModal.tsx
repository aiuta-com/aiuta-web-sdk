import React from 'react'
import { SecondaryButton } from '@/components'
import { HistoryImagesRemoveModalTypes } from './types'
import styles from './historyImagesRemoveModal.module.scss'

export const HistoryImagesRemoveModal = (props: HistoryImagesRemoveModalTypes) => {
  const { onClickLeftButton, onClickRightButton, isVisible } = props

  return (
    <div
      className={`${styles.historyImagesModal} ${
        isVisible ? styles.historyImagesModalActive : ''
      } `}
    >
      <div className={styles.moadlContent}>
        <h3 className={styles.text}>Are you sure that you want to delete this try-ons?</h3>
        <div className={styles.buttonsLine}>
          <SecondaryButton text="Keep" onClick={onClickLeftButton} />
          <SecondaryButton text="Delete" onClick={onClickRightButton} />
        </div>
      </div>
    </div>
  )
}
