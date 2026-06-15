import React from 'react'
import { PrimaryButton, SecondaryButton } from '@/components'
import { useImagePickerStrings, useImagePickerImages, usePredefinedModelsStrings } from '@/hooks'
import { UploadPromptProps } from './types'
import { combineClassNames } from '@/utils'
import styles from './UploadPrompt.module.scss'

export const UploadPrompt = (props: UploadPromptProps) => {
  const { onClick, onModelsClick, className } = props
  const { imagePickerTitle, imagePickerDescription, imagePickerButtonUploadPhoto } =
    useImagePickerStrings()
  const { zeroStateImage } = useImagePickerImages()
  const { predefinedModelsTitle, predefinedModelsOr } = usePredefinedModelsStrings()

  return (
    <div className={combineClassNames(styles.card, className)}>
      {/* Zero-state artwork fit into a reserved slot (onboarding principle) */}
      <img className={styles.image} src={zeroStateImage} alt="" draggable={false} />

      {/* Text content */}
      <div className={styles.content}>
        <h2 className={combineClassNames('aiuta-title-m', styles.title)}>{imagePickerTitle}</h2>
        <p className={combineClassNames('aiuta-label-regular', styles.subtitle)}>
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
            <p className={combineClassNames('aiuta-label-regular', styles.or)}>
              {predefinedModelsOr}
            </p>
            <SecondaryButton
              onClick={onModelsClick}
              shape="M"
              variant="on-dark"
              classNames={styles.button}
            >
              {predefinedModelsTitle}
            </SecondaryButton>
          </>
        )}
      </div>
    </div>
  )
}
