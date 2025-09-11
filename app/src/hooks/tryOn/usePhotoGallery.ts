import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { inputImagesSelector } from '@/store/slices/uploadsSlice/selectors'
import { InputImage } from '@/utils/api/tryOnApiService'

export const usePhotoGallery = () => {
  const dispatch = useAppDispatch()
  const recentlyPhotos = useAppSelector(inputImagesSelector)

  const addPhotoToGallery = (photo: InputImage) => {
    dispatch(uploadsSlice.actions.addInputImage(photo))
  }

  const removePhotoFromGallery = (imageId: string) => {
    const filteredPhotos = recentlyPhotos.filter(({ id }) => id !== imageId)

    dispatch(uploadsSlice.actions.setInputImages(filteredPhotos))
  }

  const getRecentPhoto = (): InputImage | null => {
    return recentlyPhotos.length > 0 ? recentlyPhotos[0] : null
  }

  return {
    recentlyPhotos,
    addPhotoToGallery,
    removePhotoFromGallery,
    getRecentPhoto,
  }
}
