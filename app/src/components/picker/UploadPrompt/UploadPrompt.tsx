import React from 'react'
import { Flex, PrimaryButton, SecondaryButton } from '@/components'
import { useImagePickerStrings, usePredefinedModelsStrings } from '@/hooks'
import { UploadPromptProps } from './types'
import styles from './UploadPrompt.module.scss'
import { combineClassNames } from '@/utils'

export const UploadPrompt = (props: UploadPromptProps) => {
  const { onClick, onModelsClick } = props
  const { imagePickerTitle, imagePickerDescription, imagePickerButtonUploadPhoto } =
    useImagePickerStrings()
  const { predefinedModelsTitle } = usePredefinedModelsStrings()

  return (
    <Flex contentClassName={combineClassNames('aiuta-image-l', styles.uploadPrompt)}>
      {/* Example images */}
      <div className={styles.examples}>
        <img
          src={'./images/image-picker-sample-1.png'}
          className={combineClassNames(styles.sample, styles.sample1)}
          alt="Example"
          draggable={false}
        />
        <img
          src={'./images/image-picker-sample-2.png'}
          className={combineClassNames(styles.sample, styles.sample2)}
          alt="Example"
          draggable={false}
        />
      </div>

      {/* Text content */}
      <div className={styles.content}>
        <h2 className={combineClassNames('aiuta-title-m', styles.title)}>{imagePickerTitle}</h2>
        <p className={combineClassNames('aiuta-label-subtle', styles.subtitle)}>
          {imagePickerDescription}
        </p>
      </div>

      {/* Buttons */}
      <div className={styles.buttons}>
        <PrimaryButton onClick={onClick} className={styles.button} maxWidth={false}>
          {imagePickerButtonUploadPhoto}
        </PrimaryButton>

        {onModelsClick && (
          <>
            <p className={combineClassNames('aiuta-label-regular', styles.or)}>Or</p>
            <SecondaryButton
              text={predefinedModelsTitle}
              onClick={onModelsClick}
              shape="M"
              variant="on-dark"
              classNames={styles.button}
            />
          </>
        )}
      </div>
    </Flex>
  )
}
