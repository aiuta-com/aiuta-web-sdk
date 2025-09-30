import React from 'react'
import { Flex, PrimaryButton } from '@/components'
import { UploadPromptProps } from './types'
import styles from './UploadPrompt.module.scss'
import { combineClassNames } from '@/utils'

export const UploadPrompt = (props: UploadPromptProps) => {
  const { onClick, buttonText = 'Upload a photo of you' } = props

  return (
    <Flex contentClassName={combineClassNames('aiuta-image-l', styles.uploadPrompt)}>
      <img
        src={'./images/image-picker-silhouette.svg'}
        className={styles.silhouette}
        alt="Silhouette"
      />

      <PrimaryButton onClick={onClick} className={styles.button} maxWidth={false}>
        {buttonText}
      </PrimaryButton>
    </Flex>
  )
}
