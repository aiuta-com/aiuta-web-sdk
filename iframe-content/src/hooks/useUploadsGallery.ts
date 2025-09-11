import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { fileSlice } from '@lib/redux/slices/fileSlice'
import { configSlice } from '@lib/redux/slices/configSlice'
import { generateSlice } from '@lib/redux/slices/generateSlice'
import { isSelectPreviouselyImagesSelector } from '@lib/redux/slices/configSlice/selectors'
import { recentlyPhotosSelector } from '@lib/redux/slices/generateSlice/selectors'
import { useImageGallery } from './useImageGallery'
import { useImageUpload } from './useImageUpload'
import { ImageItem } from './useFullScreenViewer'

/**
 * Hook for managing uploaded photos gallery functionality
 */
export const useUploadsGallery = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector)
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
      dispatch(fileSlice.actions.setUploadViewFile({ id: image.id, url: image.url }))
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
    dispatch(generateSlice.actions.setRecentlyPhotos(updatedPhotos))
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
