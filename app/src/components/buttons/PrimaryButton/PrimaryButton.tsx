import React, { useMemo } from 'react'
import { PrimaryButtonProps } from './types'
import styles from './PrimaryButton.module.scss'

export const PrimaryButton = (props: PrimaryButtonProps) => {
  const { disabled, children, iconUrl, onClick, className } = props

  const buttonClasses = useMemo(() => {
    const classes = ['aiuta-button-m', styles.primaryButton]
    if (disabled) {
      classes.push(styles.primaryButton_disabled)
    }
    if (className) {
      classes.push(className)
    }
    return classes.join(' ')
  }, [disabled, className])

  return (
    <button disabled={disabled} className={buttonClasses} onClick={onClick}>
      {iconUrl && <img src={iconUrl} alt="" className={styles.icon} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
