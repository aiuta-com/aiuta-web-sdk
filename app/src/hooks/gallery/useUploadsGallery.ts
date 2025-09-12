import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { configSlice } from '@/store/slices/configSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { isSelectPreviouselyImagesSelector } from '@/store/slices/configSlice/selectors'
import { inputImagesSelector } from '@/store/slices/uploadsSlice/selectors'
import { useImageGallery } from './useImageGallery'
import { useImageUpload } from '@/hooks/upload/useImageUpload'
import { ImageItem } from './useFullScreenViewer'

/**
 * Hook for managing uploaded photos gallery functionality
 */
export const useUploadsGallery = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const recentlyPhotos = useAppSelector(inputImagesSelector)
  const isSelectPreviouslyImages = useAppSelector(isSelectPreviouselyImagesSelector)
  const { uploadImage } = useImageUpload()

  // Convert Redux photos to ImageItem format
  const images: ImageItem[] = recentlyPhotos.map(({ id, url }) => ({ id, url }))

  const gallery = useImageGallery({
    images,
    galleryType: 'uploads',
    modalType: 'previously',
    onImageSelect: handleImageSelect,
    onImageDelete: handleImageDelete,
    enableSelection: false,
  })

  const { trackImageSelected } = gallery

  // Handle image selection (for try-on or full screen view)
  function handleImageSelect(image: ImageItem) {
    if (isSelectPreviouslyImages) {
      // Select image for try-on
      dispatch(uploadsSlice.actions.setCurrentImage({ id: image.id, url: image.url }))
      navigate('/view')
      trackImageSelected(image.id)
    } else {
      // Show full screen view
      gallery.showFullScreen(image)
    }
    // Reset selection state
    dispatch(configSlice.actions.setIsSelectPreviouselyImages(false))
  }

  // Handle image deletion
  function handleImageDelete(imageId: string) {
    const updatedPhotos = recentlyPhotos.filter(({ id }) => id !== imageId)
    dispatch(uploadsSlice.actions.setInputImages(updatedPhotos))
  }

  // Handle new photo upload
  const handlePhotoUpload = useCallback(
    async (file: File) => {
      await uploadImage(file, () => {
        // Navigate to try-on page after successful upload
        navigate('/view')
      })
    },
    [uploadImage, navigate],
  )

  // Navigate to upload page
  const navigateToUpload = useCallback(() => {
    if (recentlyPhotos.length === 0) {
      // If no photos, redirect immediately
      navigate('/qr')
    } else {
      // Navigate to upload page
      navigate('/qr')
    }
  }, [navigate, recentlyPhotos.length])

  // Auto-redirect to QR page if no photos (maintaining existing behavior)
  useEffect(() => {
    if (!recentlyPhotos.length) {
      navigate('/qr')
    }
  }, [recentlyPhotos.length, navigate])

  return {
    ...gallery,
    images,
    recentlyPhotos,
    isSelectPreviouslyImages,
    handlePhotoUpload,
    navigateToUpload,
  }
}
