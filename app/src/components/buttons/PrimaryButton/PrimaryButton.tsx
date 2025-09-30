import React from 'react'
import { combineClassNames } from '@/utils'
import { PrimaryButtonProps } from './types'
import styles from './PrimaryButton.module.scss'

export const PrimaryButton = (props: PrimaryButtonProps) => {
  const { disabled, children, onClick, className, maxWidth = true } = props

  const buttonClasses = combineClassNames(
    'aiuta-button-m',
    styles.primaryButton,
    disabled && styles.primaryButton_disabled,
    maxWidth && styles.primaryButton_maxWidth,
    className,
  )

  return (
    <button disabled={disabled} className={buttonClasses} onClick={onClick}>
      <span>{children}</span>
    </button>
  )
}
