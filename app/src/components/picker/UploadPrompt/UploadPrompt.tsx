import React from 'react'
import { Flex, PrimaryButton } from '@/components'
import { useImagePickerStrings } from '@/hooks'
import { UploadPromptProps } from './types'
import styles from './UploadPrompt.module.scss'
import { combineClassNames } from '@/utils'

export const UploadPrompt = (props: UploadPromptProps) => {
  const { onClick, buttonText } = props
  const { imagePickerButtonUploadImage } = useImagePickerStrings()

  const displayText = buttonText ?? imagePickerButtonUploadImage

  return (
    <Flex contentClassName={combineClassNames('aiuta-image-l', styles.uploadPrompt)}>
      <img
        src={'./images/image-picker-silhouette.svg'}
        className={styles.silhouette}
        alt="Silhouette"
      />

      <PrimaryButton onClick={onClick} className={styles.button} maxWidth={false}>
        {displayText}
      </PrimaryButton>
    </Flex>
  )
}
