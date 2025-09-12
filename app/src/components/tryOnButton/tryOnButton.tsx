import React from 'react'
import { TryOnButtonTypes } from './types'
import styles from './tryOnButton.module.scss'

export const TryOnButton = (props: TryOnButtonTypes) => {
  const { disabled, children, isShowTryOnIcon, onClick } = props

  return (
    <button
      disabled={disabled}
      className={`${styles.tryOnButton} ${disabled ? styles.disabledButton : ''} `}
      onClick={onClick}
    >
      <>
        {isShowTryOnIcon && <img alt="Try On icon" src={'./icons/tryOn.svg'} />} {children}
      </>
    </button>
  )
}
