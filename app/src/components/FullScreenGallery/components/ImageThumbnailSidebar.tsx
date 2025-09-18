import React from 'react'
import { ImageType } from '../types'
import styles from '../FullScreenGallery.module.scss'

interface ImageThumbnailSidebarProps {
  images: ImageType[]
  activeImageId: string
  onImageSelect: (image: ImageType) => void
}

export const ImageThumbnailSidebar = ({
  images,
  activeImageId,
  onImageSelect,
}: ImageThumbnailSidebarProps) => {
  if (images.length <= 1) {
    return null
  }

  return (
    <div className={styles.leftContent}>
      {images.map((image) => (
        <div
          key={image.id}
          className={`${styles.miniImageBox} ${image.id === activeImageId ? styles.active : ''}`}
          onClick={() => onImageSelect(image)}
        >
          <img src={image.url} alt="Thumbnail" className={styles.miniImage} />
          <div className={styles.miniImageBorder} />
        </div>
      ))}
    </div>
  )
}
