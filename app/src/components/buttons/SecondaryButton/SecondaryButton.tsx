import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { SecondaryButtonProps } from './types'
import styles from './SecondaryButton.module.scss'

export const SecondaryButton = (props: SecondaryButtonProps) => {
  const {
    children,
    icon,
    shape = 'S',
    variant = 'default',
    maxWidth = false,
    classNames,
    onClick,
  } = props

  // Get shape class based on size
  const shapeClass = shape === 'M' ? 'aiuta-button-m' : 'aiuta-button-s'
  const variantClass = variant === 'on-dark' ? styles.secondaryButton_onDark : ''
  const buttonClasses = combineClassNames(
    shapeClass,
    styles.secondaryButton,
    variantClass,
    maxWidth && styles.secondaryButton_maxWidth,
    classNames,
  )

  return (
    <button className={buttonClasses} onClick={onClick}>
      {icon && <Icon icon={icon} size={20} className={styles.icon} />}
      <span>{children}</span>
    </button>
  )
}
