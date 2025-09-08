import React from 'react'
// redux
import { useAppSelector } from '@lib/redux/store'

// selectors
import { showHistoryImagesModalSelector } from '@lib/redux/slices/modalSlice/selectors'

// components
import { SecondaryButton } from '@/components/feature'

// types
import { HistoryImagesRemoveModalTypes } from './types'

// styles
import styles from './historyImagesRemoveModal.module.scss'
import { stylesConfigurationSelector } from '@lib/redux/slices/configSlice/selectors'

export const HistoryImagesRemoveModal = (props: HistoryImagesRemoveModalTypes) => {
  const { onClickLeftButton, onClickRightButton } = props

  const stylesConfiguration = useAppSelector(stylesConfigurationSelector)
  const showHistoryImagesModal = useAppSelector(showHistoryImagesModalSelector)

  return (
    <div
      className={`${styles.historyImagesModal} ${
        showHistoryImagesModal ? styles.historyImagesModalActive : ''
      } ${stylesConfiguration.components.historyImagesRemoveModalClassName}`}
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
