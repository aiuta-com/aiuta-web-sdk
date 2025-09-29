import React from 'react'
import { combineClassNames } from '@/utils'
import { Icon } from '@/components'
import { TryOnButtonProps } from './types'
import { icons } from './icons'
import styles from './TryOnButton.module.scss'

export const TryOnButton = (props: TryOnButtonProps) => {
  const { children, onClick, hidden = false, className } = props

  const buttonClasses = combineClassNames(
    'aiuta-button-m',
    styles.tryOnButton,
    hidden && styles.tryOnButton_hidden,
    className,
  )

  return (
    <button className={buttonClasses} onClick={onClick} disabled={hidden}>
      <Icon icon={icons.magic} size={16} viewBox="0 0 16 16" className={styles.icon} />
      <span>{children}</span>
    </button>
  )
}
