import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { Icon } from '@/components/ui/Icon'
import { combineClassNames } from '@/utils'
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

  const buttonClassName = combineClassNames(
    styles.iconButton,
    isMobile && styles.iconButton_mobile,
    className,
  )

  return (
    <button
      className={buttonClassName}
      onClick={(e) => onClick?.(e)}
      aria-label={label}
      type="button"
    >
      <Icon icon={icon} size={size} viewBox={viewBox} alt={label} />
    </button>
  )
}
