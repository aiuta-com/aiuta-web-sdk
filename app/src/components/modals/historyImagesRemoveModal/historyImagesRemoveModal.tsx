import React from 'react'
import { useAppSelector } from '@/store/store'
import { showHistoryImagesModalSelector } from '@/store/slices/modalSlice/selectors'
import { SecondaryButton } from '@/components'
import { HistoryImagesRemoveModalTypes } from './types'
import styles from './historyImagesRemoveModal.module.scss'

export const HistoryImagesRemoveModal = (props: HistoryImagesRemoveModalTypes) => {
  const { onClickLeftButton, onClickRightButton } = props

  const showHistoryImagesModal = useAppSelector(showHistoryImagesModalSelector)

  return (
    <div
      className={`${styles.historyImagesModal} ${
        showHistoryImagesModal ? styles.historyImagesModalActive : ''
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
