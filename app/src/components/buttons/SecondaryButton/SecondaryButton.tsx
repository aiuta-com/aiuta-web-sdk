import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { SecondaryButtonProps } from './types'
import styles from './SecondaryButton.module.scss'

export const SecondaryButton = (props: SecondaryButtonProps) => {
  const { text, icon, shape = 'S', classNames, onClick } = props

  // Get shape class based on size
  const shapeClass = shape === 'M' ? 'aiuta-button-m' : 'aiuta-button-s'
  const buttonClasses = combineClassNames(shapeClass, styles.secondaryButton, classNames)

  return (
    <button className={buttonClasses} onClick={onClick}>
      {icon && <Icon icon={icon} size={20} className={styles.icon} />}
      <span>{text}</span>
    </button>
  )
}
