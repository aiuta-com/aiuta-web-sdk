import React, { useMemo } from 'react'
import { SecondaryButtonProps } from './types'
import styles from './SecondaryButton.module.scss'

export const SecondaryButton = (props: SecondaryButtonProps) => {
  const { text, iconUrl, classNames, onClick } = props

  const buttonClasses = useMemo(
    () => [styles.secondaryButton, classNames].filter(Boolean).join(' '),
    [classNames],
  )

  return (
    <button className={buttonClasses} onClick={onClick}>
      {iconUrl && <img src={iconUrl} alt="" className={styles.icon} aria-hidden="true" />}
      <span className={styles.text}>{text}</span>
    </button>
  )
}
