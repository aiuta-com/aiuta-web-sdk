import React from 'react'
import { TryOnButtonProps } from './types'
import styles from './TryOnButton.module.scss'

export const TryOnButton = (props: TryOnButtonProps) => {
  const { children, isShowTryOnIcon = true, onClick, hidden = false } = props

  return (
    <button
      className={`${styles.tryOnButton} ${hidden ? styles.tryOnButton_hidden : ''}`}
      onClick={onClick}
      disabled={hidden}
    >
      {isShowTryOnIcon && (
        <img alt="Try On icon" src="./icons/tryOn.svg" className={styles.icon} aria-hidden="true" />
      )}
      <span>{children}</span>
    </button>
  )
}
