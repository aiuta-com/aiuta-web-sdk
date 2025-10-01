import { useLocation } from 'react-router-dom'

export const usePageBarTitle = () => {
  const location = useLocation()

  const getTitle = () => {
    switch (location.pathname) {
      case '/generations':
        return 'History'
      case '/uploads':
        return 'Previously used photos'
      default:
        return 'Virtual Try-On'
    }
  }

  return { title: getTitle() }
}
