import React from 'react'
import { SelectableImage } from '@/components'
import { ImageItem } from '@/hooks/gallery/useFullScreenViewer'
import { combineClassNames } from '@/utils'
import styles from './ImageGallery.module.scss'

interface ImageGalleryProps {
  images: ImageItem[]
  onImageClick: (image: ImageItem) => void
  galleryType?: 'generations' | 'uploads'
  className?: string
}

/**
 * Universal image gallery component
 */
export const ImageGallery = ({
  images,
  onImageClick,
  galleryType,
  className,
}: ImageGalleryProps) => {
  if (images.length === 0) {
    return null
  }

  return (
    <div className={combineClassNames(styles.imageGallery, className)}>
      {images.map((image, index) => {
        const key = `${image.id}-${index}-${images.length}`

        return (
          <SelectableImage
            key={key}
            src={image.url}
            imageId={image.id}
            galleryType={galleryType}
            onClick={() => onImageClick(image)}
          />
        )
      })}
    </div>
  )
}
