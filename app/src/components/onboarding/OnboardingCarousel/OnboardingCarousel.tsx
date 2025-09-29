import React from 'react'
import { CrossFadeImage } from '@/components'
import { OnboardingCarouselProps } from './types'
import { combineClassNames } from '@/utils'
import styles from './OnboardingCarousel.module.scss'

export const OnboardingCarousel = ({
  items,
  activeIndex,
  onItemChange,
  className,
}: OnboardingCarouselProps) => {
  const containerClasses = combineClassNames(styles.onboardingCarousel, className)

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
