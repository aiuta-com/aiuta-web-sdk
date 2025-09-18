import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, isAppVisibleSelector } from '@/store/slices/appSlice'
import { useWindowResize } from '@/hooks'
import styles from './AppContainer.module.scss'

interface AppContainerProps {
  children: React.ReactNode
}

/**
 * App container that handles app sizing and positioning
 * Now that iframe is fullscreen, app needs to manage its own dimensions
 */
export const AppContainer = ({ children }: AppContainerProps) => {
  // Handle window resize for mobile/desktop switching
  useWindowResize()

  const isMobile = useAppSelector(isMobileSelector)
  const isVisible = useAppSelector(isAppVisibleSelector)

  const containerClasses = [
    styles.appContainer,
    isMobile ? styles.appContainer_mobile : styles.appContainer_desktop,
    !isVisible ? styles.appContainer_hidden : '',
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={containerClasses}>{children}</div>
}
