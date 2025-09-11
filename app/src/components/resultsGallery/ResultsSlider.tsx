import React from 'react'
import { MiniSliderItem } from '@/components'
import { ImageItem } from '@/hooks/gallery/useFullScreenViewer'

interface ResultsSliderProps {
  images: ImageItem[]
  activeIndex: number
  onItemClick: (index: number) => void
  className?: string
}

/**
 * Slider component for results gallery
 */
export const ResultsSlider: React.FC<ResultsSliderProps> = ({
  images,
  activeIndex,
  onItemClick,
  className,
}) => {
  if (images.length <= 1) {
    return null
  }

  return (
    <div className={className}>
      {images.map((image, index) => (
        <MiniSliderItem
          key={image.id}
          src={image.url}
          isActive={activeIndex === index}
          onClick={() => onItemClick(index)}
        />
      ))}
    </div>
  )
}
