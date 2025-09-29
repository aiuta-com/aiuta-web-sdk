import React from 'react'
import { PrimaryButton } from '@/components'
import { UploadPromptProps } from './types'
import styles from './UploadPrompt.module.scss'

export const UploadPrompt = (props: UploadPromptProps) => {
  const { onClick, buttonText = 'Upload a photo of you' } = props

  return (
    <div className={styles.uploadPrompt}>
      <img src={'./icons/tokenBannerGirl.svg'} alt="Girl icon" />
      <div className={styles.buttonContainer}>
        <PrimaryButton onClick={onClick}>{buttonText}</PrimaryButton>
      </div>
    </div>
  )
}
