import { useLocation } from 'react-router-dom'
import {
  useTryOnStrings,
  useImagePickerStrings,
  usePredefinedModelsStrings,
  useSizeFitStrings,
} from '@/hooks'

export const usePageBarTitle = () => {
  const location = useLocation()
  const { tryOnPageTitle, generationsHistoryPageTitle } = useTryOnStrings()
  const { uploadsHistoryTitle } = useImagePickerStrings()
  const { predefinedModelsTitle } = usePredefinedModelsStrings()
  const { sizeFitResultsTitle } = useSizeFitStrings()

  const getTitle = () => {
    switch (location.pathname) {
      case '/generations':
        return generationsHistoryPageTitle
      case '/uploads':
        return uploadsHistoryTitle
      case '/models':
        return predefinedModelsTitle
      case '/size-fit/results':
        return sizeFitResultsTitle
      default:
        return tryOnPageTitle
    }
  }

  return { title: getTitle() }
}
