import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { generateSlice } from '@lib/redux/slices/generateSlice'
import { recentlyPhotosSelector } from '@lib/redux/slices/generateSlice/selectors'
import { UploadedImage } from '../../utils/apiService'

const STORAGE_KEY = 'tryon-recent-photos'

export const usePhotoGallery = () => {
  const dispatch = useAppDispatch()
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector)

  const addPhotoToGallery = (photo: UploadedImage) => {
    const existingPhotos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const newPhotos = [photo, ...existingPhotos]

    dispatch(generateSlice.actions.setRecentlyPhotos(newPhotos))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPhotos))
  }

  const removePhotoFromGallery = (imageId: string) => {
    const filteredPhotos = recentlyPhotos.filter(({ id }) => id !== imageId)

    dispatch(generateSlice.actions.setRecentlyPhotos(filteredPhotos))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPhotos))
  }

  const getRecentPhoto = (): UploadedImage | null => {
    return recentlyPhotos.length > 0 ? recentlyPhotos[0] : null
  }

  return {
    recentlyPhotos,
    addPhotoToGallery,
    removePhotoFromGallery,
    getRecentPhoto,
  }
}
