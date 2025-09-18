export interface CarouselItem {
  /** Main image URL for full display */
  imageUrl: string
  /** Thumbnail image URL for mini indicators */
  miniImageUrl: string
  /** Alt text for accessibility */
  altText?: string
}

export interface OnboardingCarouselProps {
  /** Array of carousel items */
  items: CarouselItem[]
  /** Currently active item index */
  activeIndex: number
  /** Callback when carousel item changes */
  onItemChange: (index: number) => void
  /** Custom className */
  className?: string
}
