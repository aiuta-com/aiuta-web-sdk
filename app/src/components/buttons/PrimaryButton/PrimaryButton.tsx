import React from 'react'
import { combineClassNames } from '@/utils'
import { PrimaryButtonProps } from './types'
import styles from './PrimaryButton.module.scss'

export const PrimaryButton = (props: PrimaryButtonProps) => {
  const { disabled, children, iconUrl, onClick, className } = props

  const buttonClasses = combineClassNames(
    'aiuta-button-m',
    styles.primaryButton,
    disabled && styles.primaryButton_disabled,
    className,
  )

  return (
    <button disabled={disabled} className={buttonClasses} onClick={onClick}>
      {iconUrl && <img src={iconUrl} alt="" className={styles.icon} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
