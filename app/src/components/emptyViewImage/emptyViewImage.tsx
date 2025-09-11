import React from 'react'
// components
import { TryOnButton } from '@/components'

// types
import { EmptyViewImageTypes } from './types'

// styles
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
