import React from 'react'
import styles from '../FullScreenGallery.module.scss'

interface FullScreenImageViewerProps {
  imageUrl: string
  altText?: string
}

export const FullScreenImageViewer = ({
  imageUrl,
  altText = 'Full Screen Image',
}: FullScreenImageViewerProps) => {
  return (
    <div className={styles.imageContainer}>
      <img src={imageUrl} alt={altText} className={styles.activeImage} />
    </div>
  )
}
