import { useCallback, useRef, useState, UIEvent } from 'react'
import { useAppSelector } from '@/store/store'
import { generatedImagesSelector } from '@/store/slices/generationsSlice/selectors'
import { useFullScreenViewer } from '@/hooks/gallery/useFullScreenViewer'
import { ImageItem } from '@/hooks/gallery/useFullScreenViewer'

const GENERATED_IMAGE_HEIGHT = 460
const SLIDE_ITEM_IMAGE_HEIGHT = 96

/**
 * Hook for managing results gallery with synchronized scrolling
 */
export const useResultsGallery = () => {
  const [slideItemIndex, setSlideItemIndex] = useState<number>(0)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const miniSliderContentRef = useRef<HTMLDivElement | null>(null)
  const generatedImagesContentRef = useRef<HTMLDivElement | null>(null)

  // Convert Redux images to ImageItem format
  const images: ImageItem[] = generatedImages.map(({ id, url }) => ({ id, url }))

  const { showFullScreen } = useFullScreenViewer({ modalType: 'generations', images })

  // Handle slider item click with synchronized scrolling
  const handleSliderItemClick = useCallback((index: number) => {
    setSlideItemIndex(index)

    const scrollToSliderContent = index * SLIDE_ITEM_IMAGE_HEIGHT - 200
    const scrollToGeneratedImagesContent = index * GENERATED_IMAGE_HEIGHT

    if (miniSliderContentRef.current) {
      miniSliderContentRef.current.scrollTop = scrollToSliderContent
    }

    if (generatedImagesContentRef.current) {
      generatedImagesContentRef.current.scrollTop = scrollToGeneratedImagesContent
    }
  }, [])

  // Handle scroll position detection for synchronization
  const handleScrollPositionDetection = useCallback((event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement

    for (const element of target.children) {
      if ('id' in element) {
        const elementIndex = Number(element.id)
        if (elementIndex * GENERATED_IMAGE_HEIGHT === target.scrollTop) {
          setSlideItemIndex(elementIndex)

          if (miniSliderContentRef.current) {
            miniSliderContentRef.current.scrollTop = elementIndex * SLIDE_ITEM_IMAGE_HEIGHT - 200
          }
        }
      }
    }
  }, [])

  // Handle full screen image view
  const handleImageClick = useCallback(
    (image: ImageItem) => {
      showFullScreen(image)
    },
    [showFullScreen],
  )

  return {
    // State
    slideItemIndex,
    images,
    generatedImages,
    hasMultipleImages: generatedImages.length > 1,
    currentImage: generatedImages[slideItemIndex],

    // Refs
    miniSliderContentRef,
    generatedImagesContentRef,

    // Event handlers
    handleSliderItemClick,
    handleScrollPositionDetection,
    handleImageClick,

    // Constants
    GENERATED_IMAGE_HEIGHT,
    SLIDE_ITEM_IMAGE_HEIGHT,
  }
}
