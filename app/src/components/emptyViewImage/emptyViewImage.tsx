import React from 'react'
import { TryOnButton } from '@/components'
import { EmptyViewImageTypes } from './types'
import styles from './emptyViewImage.module.scss'

export const EmptyViewImage = (props: EmptyViewImageTypes) => {
  const { onClick } = props

  return (
    <div className={styles.banner}>
      <img src={'./icons/tokenBannerGirl.svg'} alt="Girl icon" />
      <div className={styles.uploadBtnContent}>
        <TryOnButton onClick={onClick}>Upload a photo of you</TryOnButton>
      </div>
    </div>
  )
}
