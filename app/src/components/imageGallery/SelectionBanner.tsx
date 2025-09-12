import React from 'react'
import { RemoveHistoryBanner } from '@/components'
import styles from './imageGallery.module.scss'

interface SelectionBannerProps {
  hasSelection: boolean
  isMobile?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Banner component for displaying selection actions
 */
export const SelectionBanner: React.FC<SelectionBannerProps> = ({
  hasSelection,
  isMobile,
  className,
  children,
}) => {
  return (
    <div
      className={`${styles.selectionBanner} ${
        hasSelection && isMobile
          ? styles.activeSelectionBannerMobile
          : hasSelection
            ? styles.activeSelectionBanner
            : ''
      } ${className || ''}`}
    >
      {children || <RemoveHistoryBanner />}
    </div>
  )
}
