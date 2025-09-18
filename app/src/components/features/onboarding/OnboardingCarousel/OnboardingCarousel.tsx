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
      {/* Thumbnail indicators on the left */}
      <div className={styles.miniImagesBox}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`${styles.imageBanner} ${
              activeIndex === index ? styles.imageBanner_active : ''
            }`}
            onClick={() => onItemChange(index)}
          >
            <img
              loading="lazy"
              alt={item.altText || `Thumbnail ${index + 1}`}
              src={item.miniImageUrl}
              className={styles.miniImage}
            />
          </div>
        ))}
      </div>

      {/* Main image display */}
      <img
        loading="lazy"
        alt={currentItem?.altText || 'Onboarding step'}
        className={styles.mainImage}
        src={currentItem?.imageUrl}
      />
    </div>
  )
}
