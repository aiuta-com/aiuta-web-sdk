import React from 'react'
import { SelectableImage, DeletableImage } from '@/components'
import { EmptyGalleryState } from './EmptyGalleryState'
import { ImageItem } from '@/hooks/gallery/useFullScreenViewer'
import styles from './ImageGallery.module.scss'

interface ImageGalleryProps {
  images: ImageItem[]
  variant: 'generated' | 'uploaded'
  onImageClick: (image: ImageItem) => void
  onImageDelete?: (imageId: string) => void
  enableSelection?: boolean
  galleryType?: 'generations' | 'uploads'
  emptyMessage: string
  emptyIcon?: string
  className?: string
  isMobile?: boolean
}

/**
 * Universal image gallery component
 */
export const ImageGallery = ({
  images,
  variant,
  onImageClick,
  onImageDelete,
  enableSelection,
  galleryType,
  emptyMessage,
  emptyIcon,
  className,
  isMobile,
}: ImageGalleryProps) => {
  if (images.length === 0) {
    return <EmptyGalleryState message={emptyMessage} icon={emptyIcon} />
  }

  return (
    <div
      className={`${styles.imageContent} ${isMobile ? styles['imageContent--mobile'] : ''} ${className || ''}`}
    >
      {images.map((image, index) => {
        const key = `${image.id}-${index}-${images.length}`
        const classNames = isMobile ? styles['selectableImage--mobile'] : ''

        // Show SelectableImage for:
        // 1. Generated images (always)
        // 2. When selection is enabled (any variant)
        // 3. Uploaded images on desktop (no individual delete buttons on desktop)
        if (variant === 'generated' || enableSelection || (variant === 'uploaded' && !isMobile)) {
          return (
            <SelectableImage
              key={key}
              src={image.url}
              imageId={image.id}
              classNames={classNames}
              galleryType={galleryType}
              onClick={() => onImageClick(image)}
            />
          )
        }

        // variant === 'uploaded' and mobile (show individual delete buttons)
        return (
          <DeletableImage
            key={key}
            src={image.url}
            imageId={image.id}
            classNames={classNames}
            showTrashIcon={true}
            onClick={() => onImageClick(image)}
            onDelete={onImageDelete ? () => onImageDelete(image.id) : undefined}
          />
        )
      })}
    </div>
  )
}
