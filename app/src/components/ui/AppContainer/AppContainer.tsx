import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, isAppVisibleSelector } from '@/store/slices/appSlice'
import { useWindowResize, useParentScrollPrevention } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './AppContainer.module.scss'

interface AppContainerProps {
  children: React.ReactNode
}

/**
 * App container that handles app sizing and positioning
 */
export const AppContainer = ({ children }: AppContainerProps) => {
  useWindowResize()
  const isMobile = useAppSelector(isMobileSelector)
  const isVisible = useAppSelector(isAppVisibleSelector)
  useParentScrollPrevention(isVisible)

  const containerClasses = combineClassNames(
    !isMobile && 'aiuta-modal',
    styles.appContainer,
    isMobile ? styles.appContainer_mobile : styles.appContainer_desktop,
    !isVisible && styles.appContainer_hidden,
  )

  return (
    <div className={containerClasses} data-testid="aiuta-app-container">
      {children}
    </div>
  )
}
