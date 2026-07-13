import React, { useState, useEffect } from 'react'
import {
  usePageBarNavigation,
  usePageBarVisibility,
  usePageBarTitle,
  useSwipeGesture,
  useSelectionStrings,
  useAppVisibility,
  useSizeFitSteps,
} from '@/hooks'
import { IconButton } from '@/components'
import { combineClassNames } from '@/utils'
import { icons } from './icons'
import styles from './PageBar.module.scss'

interface PageBarProps {
  minimal?: boolean
}

export const PageBar = ({ minimal = false }: PageBarProps) => {
  const [hasMounted, setHasMounted] = useState(false)
  const { hideApp } = useAppVisibility()

  // Early initialization
  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  // Minimal mode - only render close button without complex hooks
  // Used for error screens before StorageProvider/QueryProvider are initialized
  if (minimal) {
    return (
      <header className={styles.pageBar}>
        {/* Empty left side */}
        <div />

        {/* Center - empty */}
        <div className={styles.titleContainer} />

        {/* Right side - Close button only */}
        <IconButton
          icon={icons.close}
          label="Close"
          onClick={hideApp}
          className={styles.closeButton}
        />
      </header>
    )
  }

  // Normal mode - full PageBar with all features
  return <FullPageBar />
}

function FullPageBar() {
  const { title } = usePageBarTitle()
  const {
    showHistoryButton,
    showBackButton,
    showTitle,
    showSizeFitProgress,
    showSelectButton,
    showCloseButton,
    isSelectionActive,
    isMobile,
  } = usePageBarVisibility()

  const { handleCloseModal, handleHistoryNavigation, handleToggleSelection } =
    usePageBarNavigation()

  const { select, cancel } = useSelectionStrings()
  const { progress: sizeFitProgress } = useSizeFitSteps()

  // Swipe navigation - right swipe goes back when back button is shown
  // (through the same handler as the button, so step-wise flows work too)
  const swipeHandlers = useSwipeGesture(({ direction }) => {
    if (direction === 'right' && showBackButton) {
      handleHistoryNavigation('generations')
    }
  })

  // Select appropriate icon based on which button should be shown
  const navigationIcon = showBackButton ? icons.back : icons.history
  const navigationLabel = showBackButton ? 'Back' : 'History'

  return (
    <header
      className={combineClassNames(styles.pageBar, isMobile && styles.pageBar_mobile)}
      {...swipeHandlers}
    >
      {/* Left side - History/Back button */}
      {(showHistoryButton || showBackButton) && (
        <IconButton
          icon={navigationIcon}
          label={navigationLabel}
          className={styles.actionButton}
          size={28}
          onClick={() => handleHistoryNavigation('generations')}
          viewBox="0 0 36 36"
        />
      )}

      {/* Center - Title (or the Size & Fit survey step progress) */}
      <div className={styles.titleContainer}>
        {showTitle && (
          <h1 className={combineClassNames('aiuta-page-title', styles.titleLabel)}>{title}</h1>
        )}
        {showSizeFitProgress && (
          <div className={styles.progress}>
            <div className={styles.progressFill} style={{ width: `${sizeFitProgress * 100}%` }} />
          </div>
        )}
      </div>

      {/* Right side - Select/Cancel button or Close button */}
      {showSelectButton ? (
        <button
          className={combineClassNames('aiuta-page-title', styles.selectButton)}
          onClick={handleToggleSelection}
        >
          {isSelectionActive ? cancel : select}
        </button>
      ) : showCloseButton ? (
        <IconButton
          icon={icons.close}
          label="Close"
          onClick={handleCloseModal}
          className={styles.closeButton}
        />
      ) : null}
    </header>
  )
}
