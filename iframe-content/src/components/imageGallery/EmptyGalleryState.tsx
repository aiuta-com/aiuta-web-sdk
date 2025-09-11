import React from 'react'
import styles from './imageGallery.module.scss'

interface EmptyGalleryStateProps {
  icon?: string
  message: string
  className?: string
}

/**
 * Empty state component for image galleries
 */
export const EmptyGalleryState: React.FC<EmptyGalleryStateProps> = ({
  icon = './icons/emptyhistory.svg',
  message,
  className,
}) => {
  return (
    <div className={`${styles.emptyContent} ${className || ''}`}>
      <img src={icon} alt="Empty gallery icon" />
      <p>{message}</p>
    </div>
  )
}
