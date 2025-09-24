import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { Icon } from '@/components/buttons/Icon'
import type { IconButtonProps } from './types'
import styles from './IconButton.module.scss'

export const IconButton = ({
  icon,
  label,
  onClick,
  className,
  size = 24,
  viewBox = '0 0 24 24',
}: IconButtonProps) => {
  const isMobile = useAppSelector(isMobileSelector)

  const buttonClassName = [
    styles.iconButton,
    isMobile ? styles.iconButton_mobile : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={buttonClassName} onClick={onClick} aria-label={label} type="button">
      <Icon icon={icon} size={size} viewBox={viewBox} />
    </button>
  )
}
