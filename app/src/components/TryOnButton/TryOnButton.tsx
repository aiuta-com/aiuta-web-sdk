import React from 'react'
import { TryOnButtonProps } from './types'
import styles from './TryOnButton.module.scss'

export const TryOnButton = (props: TryOnButtonProps) => {
  const { children, isShowTryOnIcon = true, onClick } = props

  return (
    <button
      className={styles.tryOnButton}
      onClick={onClick}
    >
      {isShowTryOnIcon && (
        <img
          alt="Try On icon"
          src="./icons/tryOn.svg"
          className={styles.icon}
          aria-hidden="true"
        />
      )}
      <span className={styles.text}>{children}</span>
    </button>
  )
}
