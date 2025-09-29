import React from 'react'
import { CrossFadeImage } from '@/components'
import { CarouselProps } from './types'
import { combineClassNames } from '@/utils'
import styles from './Carousel.module.scss'

export const Carousel = ({ items, activeIndex, onItemChange, className }: CarouselProps) => {
  const containerClasses = combineClassNames(styles.carousel, className)

  const currentItem = items[activeIndex]

  return (
    <div className={containerClasses}>
      <CrossFadeImage
        src={currentItem?.imageUrl || ''}
        alt={`Try on example ${activeIndex + 1}`}
        className={combineClassNames('aiuta-image-l', styles.carouselImage)}
      />

      <div className={styles.thumbnailsList}>
        {items.map((item, index) => (
          <div
            key={index}
            className={combineClassNames(
              'aiuta-image-s',
              styles.thumbnailItem,
              activeIndex === index && styles.thumbnailItem_active,
            )}
            onClick={() => onItemChange(index)}
          >
            <img
              alt={`Thumbnail ${index + 1}`}
              src={item.thumbnailUrl}
              className={styles.thumbnailImage}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
