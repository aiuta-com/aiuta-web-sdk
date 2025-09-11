import React from 'react'
import { SelectableImage } from '@/components/feature'
import { EmptyGalleryState } from './EmptyGalleryState'
import { ImageItem } from '@/hooks/useFullScreenViewer'
import styles from './imageGallery.module.scss'

interface ImageGalleryProps {
  images: ImageItem[]
  variant: 'history' | 'previously'
  onImageClick: (image: ImageItem) => void
  onImageDelete?: (imageId: string) => void
  emptyMessage: string
  emptyIcon?: string
  className?: string
  isMobile?: boolean
}

/**
 * Universal image gallery component
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  variant,
  onImageClick,
  onImageDelete,
  emptyMessage,
  emptyIcon,
  className,
  isMobile,
}) => {
  if (images.length === 0) {
    return <EmptyGalleryState message={emptyMessage} icon={emptyIcon} />
  }

  return (
    <div
      className={`${styles.imageContent} ${isMobile ? styles.imageContentMobile : ''} ${className || ''}`}
    >
      {images.map((image) => (
        <SelectableImage
          key={image.id}
          src={image.url}
          imageId={image.id}
          variant={variant}
          classNames={isMobile ? styles.selectableImageMobile : ''}
          onClick={() => onImageClick(image)}
          onDelete={onImageDelete ? () => onImageDelete(image.id) : undefined}
        />
      ))}
    </div>
  )
}
