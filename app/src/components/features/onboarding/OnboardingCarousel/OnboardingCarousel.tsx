import React from 'react'
import { OnboardingCarouselProps } from './types'
import styles from './OnboardingCarousel.module.scss'

export const OnboardingCarousel = ({
  items,
  activeIndex,
  onItemChange,
  className,
}: OnboardingCarouselProps) => {
  const containerClasses = [styles.onboardingCarousel, className].filter(Boolean).join(' ')

  const currentItem = items[activeIndex]

  return (
    <div className={containerClasses}>
      {/* Thumbnail indicators */}
      <div className={styles.thumbnailsList}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`${styles.thumbnailItem} ${
              activeIndex === index ? styles.thumbnailItem_active : ''
            }`}
            onClick={() => onItemChange(index)}
          >
            <img
              loading="lazy"
              alt={item.altText || `Thumbnail ${index + 1}`}
              src={item.miniImageUrl}
              className={styles.thumbnailImage}
            />
          </div>
        ))}
      </div>

      {/* Main carousel image */}
      <img
        loading="lazy"
        alt={currentItem?.altText || 'Onboarding step'}
        className={styles.carouselImage}
        src={currentItem?.imageUrl}
      />
    </div>
  )
}
