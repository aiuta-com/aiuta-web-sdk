import { useLocation } from 'react-router-dom'
import { useTryOnStrings, useImagePickerStrings } from '@/hooks'

export const usePageBarTitle = () => {
  const location = useLocation()
  const { tryOnPageTitle, generationsHistoryPageTitle } = useTryOnStrings()
  const { uploadsHistoryTitle } = useImagePickerStrings()

  const getTitle = () => {
    switch (location.pathname) {
      case '/generations':
        return generationsHistoryPageTitle
      case '/uploads':
        return uploadsHistoryTitle
      default:
        return tryOnPageTitle
    }
  }

  return { title: getTitle() }
}
