import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const usePageBarTitle = () => {
  const [title, setTitle] = useState('Virtual Try-On')
  const location = useLocation()

  useEffect(() => {
    const pathName = location.pathname

    // Set title based on current path
    switch (pathName) {
      case '/':
        setTitle('Virtual Try-On')
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
          setTitle('Virtual Try-On')
        }
    }
  }, [location.pathname])

  return { title }
}
