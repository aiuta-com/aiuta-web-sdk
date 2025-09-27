import React from 'react'
import { combineClassNames } from '@/utils'
import { Icon } from '@/components'
import { TryOnButtonProps } from './types'
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
      <Icon
        icon="<path fill-rule='evenodd' clip-rule='evenodd' d='M5.00015 1C5.43873 2.15179 6.34836 3.06142 7.50015 3.5C6.34836 3.93858 5.43873 4.84821 5.00015 6C4.56157 4.84821 3.65194 3.93858 2.50015 3.5C3.65194 3.06142 4.56157 2.15179 5.00015 1ZM11.5002 9.5C11.9387 10.6518 12.8484 11.5614 14.0002 12C12.8484 12.4386 11.9387 13.3482 11.5002 14.5C11.0616 13.3482 10.1519 12.4386 9.00015 12C10.1519 11.5614 11.0616 10.6518 11.5002 9.5ZM15.5002 5C14.3484 4.56142 13.4387 3.65179 13.0002 2.5C12.5616 3.65179 11.6519 4.56142 10.5002 5C11.6519 5.43858 12.5616 6.34821 13.0002 7.5C13.4387 6.34821 14.3484 5.43858 15.5002 5ZM8.70711 8.70711C9.09763 8.31658 9.09763 7.68342 8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289L1.29289 13.2929C0.902369 13.6834 0.902369 14.3166 1.29289 14.7071C1.68342 15.0976 2.31658 15.0976 2.70711 14.7071L8.70711 8.70711Z' fill='currentColor'/>"
        size={16}
        viewBox="0 0 16 16"
        className={styles.icon}
      />
      <span>{children}</span>
    </button>
  )
}
