import React, { useState, useEffect } from 'react'
import { usePageBarNavigation, usePageBarVisibility, usePageBarTitle } from '@/hooks'
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
    historyIconSrc,
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

  return (
    <header className={`${styles.pageBar} ${isMobile ? styles.pageBar_mobile : ''}`}>
      {/* Left side - History/Back button */}
      {(showHistoryButton || showBackButton) && (
        <img
          alt="Navigation icon"
          src={historyIconSrc}
          className={styles.navigationIcon}
          onClick={() => handleHistoryNavigation('generations-history')}
        />
      )}

      {/* Center - Title */}
      {showTitle && (
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{title}</h1>
        </div>
      )}

      {/* Right side - Select button or Close button */}
      {showSelectButton ? (
        <button
          className={`${styles.selectButton} ${isSelectionActive ? styles.selectButton_inactive : ''}`}
          onClick={handleToggleSelection}
        >
          Select
        </button>
      ) : showCloseButton ? (
        <img
          alt="Close icon"
          src="./icons/close.svg"
          className={styles.closeIcon}
          onClick={handleCloseModal}
        />
      ) : null}
    </header>
  )
}
