import React, { useRef } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, isAppVisibleSelector } from '@/store/slices/appSlice'
import { useWindowResize, usePreventParentScroll } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './AppContainer.module.scss'

interface AppContainerProps {
  children: React.ReactNode
  /** Always use the mobile fullscreen layout, regardless of width (QR upload) */
  fullscreen?: boolean
}

/**
 * App container that handles app sizing and positioning
 */
export const AppContainer = ({ children, fullscreen }: AppContainerProps) => {
  useWindowResize()
  const isMobileWidth = useAppSelector(isMobileSelector)
  const isMobile = fullscreen || isMobileWidth
  const isVisible = useAppSelector(isAppVisibleSelector)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // Keep the host page from scrolling: a wheel over the panel is contained on
  // desktop, and touch drags are contained on the mobile fullscreen layout.
  // isMobile follows window resizes, so this toggles dynamically.
  usePreventParentScroll(isVisible, isMobile, containerRef)

  const containerClasses = combineClassNames(
    !isMobile && 'aiuta-modal',
    styles.appContainer,
    isMobile ? styles.appContainer_mobile : styles.appContainer_desktop,
    !isVisible && styles.appContainer_hidden,
  )

  return (
    <div ref={containerRef} className={containerClasses} data-testid="aiuta-app-container">
      {children}
    </div>
  )
}
