import React from 'react'
import { TryOnButton } from '@/components'
import { MobileUploadPromptProps } from './types'
import styles from './MobileUploadPrompt.module.scss'

export const MobileUploadPrompt = (props: MobileUploadPromptProps) => {
  const { onClick, buttonText = 'Upload a photo of you' } = props

  return (
    <div className={styles.mobileUploadPrompt}>
      <img src={'./icons/tokenBannerGirl.svg'} alt="Girl icon" />
      <div className={styles.buttonContainer}>
        <TryOnButton onClick={onClick}>{buttonText}</TryOnButton>
      </div>
    </div>
  )
}
