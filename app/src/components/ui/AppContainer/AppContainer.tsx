import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, isAppVisibleSelector } from '@/store/slices/appSlice'
import { useWindowResize, usePreventParentScroll } from '@/hooks'
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
  // Touch-scroll containment is for the fullscreen mobile presentation only;
  // isMobile follows window resizes, so this toggles dynamically
  usePreventParentScroll(isVisible && isMobile)

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
