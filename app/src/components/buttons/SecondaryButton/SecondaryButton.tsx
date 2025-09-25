import React from 'react'
import { combineClassNames } from '@/utils'
import { SecondaryButtonProps } from './types'
import styles from './SecondaryButton.module.scss'

export const SecondaryButton = (props: SecondaryButtonProps) => {
  const { text, iconUrl, classNames, onClick } = props

  const buttonClasses = combineClassNames('aiuta-button-s', styles.secondaryButton, classNames)

  return (
    <button className={buttonClasses} onClick={onClick}>
      {iconUrl && <img src={iconUrl} alt="" className={styles.icon} aria-hidden="true" />}
      <span>{text}</span>
    </button>
  )
}
