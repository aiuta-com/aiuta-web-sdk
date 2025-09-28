import React, { useState, useEffect } from 'react'
import { usePageBarNavigation, usePageBarVisibility, usePageBarTitle } from '@/hooks'
import { IconButton } from '@/components'
import { icons } from './icons'
import styles from './PageBar.module.scss'

export const PageBar = () => {
  const [hasMounted, setHasMounted] = useState(false)

  const { title } = usePageBarTitle()
  const {
    showHistoryButton,
    showBackButton,
    showTitle,
    showSelectButton,
    showCloseButton,
    isOnHistoryPage,
    isSelectionActive,
    isMobile,
  } = usePageBarVisibility()

  const { handleCloseModal, handleHistoryNavigation, handleToggleSelection } =
    usePageBarNavigation()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  // Select appropriate icon based on current page
  const navigationIcon = isOnHistoryPage ? icons.back : icons.history
  const navigationLabel = isOnHistoryPage ? 'Back' : 'History'

  return (
    <header className={`${styles.pageBar} ${isMobile ? styles.pageBar_mobile : ''}`}>
      {/* Left side - History/Back button */}
      {(showHistoryButton || showBackButton) && (
        <IconButton
          icon={navigationIcon}
          label={navigationLabel}
          className={styles.actionButton}
          size={28}
          onClick={() => handleHistoryNavigation('generations-history')}
          viewBox="0 0 36 36"
        />
      )}

      {/* Center - Title */}
      <div className={styles.titleContainer}>
        {showTitle && <h1 className={`${styles.pageTitle} ${styles.titleLabel}`}>{title}</h1>}
      </div>

      {/* Right side - Select/Cancel button or Close button */}
      {showSelectButton ? (
        <button
          className={`${styles.pageTitle} ${styles.selectButton}`}
          onClick={handleToggleSelection}
        >
          {isSelectionActive ? 'Cancel' : 'Select'}
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
