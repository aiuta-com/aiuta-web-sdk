import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import styles from './PoweredBy.module.scss'

export const PoweredBy = () => {
  const location = useLocation()
  const isMobile = useAppSelector(isMobileSelector)

  // Routes where powered by should be hidden
  const desktopHiddenRoutes = ['/generations-history', '/uploads-history', '/results']
  const mobileHiddenRoutes = ['/onboarding', '/generations-history', '/uploads-history', '/results']

  const hiddenRoutes = isMobile ? mobileHiddenRoutes : desktopHiddenRoutes
  const isHiddenByRoute = hiddenRoutes.includes(location.pathname)

  // Hide on specific routes
  if (isHiddenByRoute) {
    return null
  }

  const text = 'Powered by Aiuta'
  const url = 'https://www.aiuta.com/'

  return (
    <footer className={styles.poweredBy}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`aiuta-button-s ${styles.label}`}
      >
        {text}
      </a>
    </footer>
  )
}
