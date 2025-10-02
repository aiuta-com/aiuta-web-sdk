import React from 'react'
import { combineClassNames } from '@/utils'
import { PrimaryButtonProps } from './types'
import styles from './PrimaryButton.module.scss'

export const PrimaryButton = (props: PrimaryButtonProps) => {
  const { disabled, children, onClick, className, maxWidth = true, shape = 'M' } = props

  // Get shape class based on size
  const shapeClass = shape === 'M' ? 'aiuta-button-m' : 'aiuta-button-s'
  const buttonClasses = combineClassNames(
    shapeClass,
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
