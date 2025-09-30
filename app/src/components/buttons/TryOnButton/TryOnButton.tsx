import React from 'react'
import { combineClassNames } from '@/utils'
import { Icon } from '@/components'
import { TryOnButtonProps } from './types'
import { icons } from './icons'
import styles from './TryOnButton.module.scss'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'

export const TryOnButton = (props: TryOnButtonProps) => {
  const { children, onClick, hidden = false, className } = props
  const isMobile = useAppSelector(isMobileSelector)

  const buttonClasses = combineClassNames(
    'aiuta-button-m',
    styles.tryOnButton,
    hidden && styles.tryOnButton_hidden,
    isMobile && styles.tryOnButton_mobile,
    className,
  )

  return (
    <button className={buttonClasses} onClick={onClick} disabled={hidden}>
      <Icon icon={icons.magic} size={16} viewBox="0 0 16 16" className={styles.icon} />
      <span>{children}</span>
    </button>
  )
}
