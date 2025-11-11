import { useLocation } from 'react-router-dom'
import { useTryOnStrings, useImagePickerStrings, usePredefinedModelsStrings } from '@/hooks'

export const usePageBarTitle = () => {
  const location = useLocation()
  const { tryOnPageTitle, generationsHistoryPageTitle } = useTryOnStrings()
  const { uploadsHistoryTitle } = useImagePickerStrings()
  const { predefinedModelsTitle } = usePredefinedModelsStrings()

  const getTitle = () => {
    switch (location.pathname) {
      case '/generations':
        return generationsHistoryPageTitle
      case '/uploads':
        return uploadsHistoryTitle
      case '/models':
        return predefinedModelsTitle
      default:
        return tryOnPageTitle
    }
  }

  return { title: getTitle() }
}
