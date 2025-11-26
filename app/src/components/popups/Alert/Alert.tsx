import React from 'react'
import { PrimaryButton } from '@/components/buttons/PrimaryButton'
import { combineClassNames } from '@/utils'
import type { AlertProps } from './types'
import styles from './Alert.module.scss'

export const Alert = ({
  animationState,
  showContent,
  message,
  buttonText,
  isVisible,
  onClose,
  className,
}: AlertProps) => {
  if (!isVisible) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close only if clicking on backdrop, not on modal content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={combineClassNames(styles.alert, styles[`alert_${animationState}`], className)}
      onClick={handleBackdropClick}
      data-testid="aiuta-alert"
    >
      {showContent && (
        <div className={combineClassNames('aiuta-modal', styles.modal)}>
          <p className={combineClassNames('aiuta-label-regular', styles.message)}>{message}</p>
          <PrimaryButton onClick={onClose} shape="S">
            {buttonText}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
