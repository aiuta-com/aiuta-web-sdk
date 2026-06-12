import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { usePoweredByStrings } from '@/hooks'
import { AiutaLogo } from './AiutaLogo'
import styles from './PoweredBy.module.scss'

export const PoweredBy = () => {
  const location = useLocation()
  const isMobile = useAppSelector(isMobileSelector)
  const { poweredByAiuta } = usePoweredByStrings()

  // Routes where powered by should be hidden
  const commonHiddenRoutes = ['/generations', '/uploads', '/results', '/models', '/qr', '/']
  const desktopHiddenRoutes = [...commonHiddenRoutes]
  const mobileHiddenRoutes = [...commonHiddenRoutes, '/onboarding']

  const hiddenRoutes = isMobile ? mobileHiddenRoutes : desktopHiddenRoutes
  const isHiddenByRoute = hiddenRoutes.includes(location.pathname)

  // Hide on specific routes
  if (isHiddenByRoute) {
    return null
  }

  const url = 'https://www.aiuta.com/'

  return (
    <footer className={styles.poweredBy}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`aiuta-label-footnote ${styles.label}`}
      >
        <span className={styles.text}>{poweredByAiuta}</span>
        <AiutaLogo className={styles.logo} />
      </a>
    </footer>
  )
}
