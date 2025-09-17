import React from 'react'
import styles from './ImageGallery.module.scss'

interface EmptyGalleryStateProps {
  icon?: string
  message: string
  className?: string
}

/**
 * Empty state component for image galleries
 */
export const EmptyGalleryState = ({
  icon = './icons/emptyhistory.svg',
  message,
  className,
}: EmptyGalleryStateProps) => {
  return (
    <div className={`${styles.emptyContent} ${className || ''}`}>
      <img src={icon} alt="Empty gallery icon" />
      <p>{message}</p>
    </div>
  )
}
