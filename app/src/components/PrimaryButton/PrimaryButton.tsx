import React from 'react'
import { PrimaryButtonProps } from './types'
import styles from './PrimaryButton.module.scss'

export const PrimaryButton = (props: PrimaryButtonProps) => {
  const { disabled, children, iconUrl, onClick, className } = props

  const buttonClasses = React.useMemo(() => {
    const classes = [styles.primaryButton]
    if (disabled) {
      classes.push(styles.primaryButtonDisabled)
    }
    if (className) {
      classes.push(className)
    }
    return classes.join(' ')
  }, [disabled, className])

  return (
    <button disabled={disabled} className={buttonClasses} onClick={onClick}>
      {iconUrl && <img src={iconUrl} alt="" className={styles.icon} aria-hidden="true" />}
      <span className={styles.text}>{children}</span>
    </button>
  )
}
