import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const usePageBarTitle = () => {
  const location = useLocation()
  const defaultTitle = 'Virtual Try-On'
  const [title, setTitle] = useState(defaultTitle)

  useEffect(() => {
    const pathName = location.pathname

    // Set title based on current path
    switch (pathName) {
      case '/':
        setTitle(defaultTitle)
        break
      case '/qr':
        setTitle('Upload Photo')
        break
      case '/view':
        setTitle('Try On')
        break
      case '/results':
        setTitle('Results')
        break
      case '/generations-history':
        setTitle('Generated Images')
        break
      case '/uploads-history':
        setTitle('Your Photos')
        break
      default:
        if (pathName.startsWith('/qr/')) {
          setTitle('Upload Photo')
        } else {
          setTitle(defaultTitle)
        }
    }
  }, [location.pathname, defaultTitle])

  return { title }
}
