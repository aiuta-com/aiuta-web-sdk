import React from 'react'
import styles from '../FullScreenGallery.module.scss'

interface ActionButtonsPanelProps {
  onShare: () => void
  onDownload: () => void
  onDelete?: () => void
  showDelete?: boolean
}

export const ActionButtonsPanel = ({
  onShare,
  onDownload,
  onDelete,
  showDelete,
}: ActionButtonsPanelProps) => {
  return (
    <div className={styles.actionButtons}>
      <div className={styles.actionButton} onClick={onShare}>
        <img src="./icons/shareFullScreen.svg" alt="Share" />
      </div>
      <div className={styles.actionButton} onClick={onDownload}>
        <img src="./icons/downloadFullScreen.svg" alt="Download" />
      </div>
      {showDelete && onDelete && (
        <div className={styles.actionButton} onClick={onDelete}>
          <img src="./icons/deleteFullScreen.svg" alt="Delete" />
        </div>
      )}
    </div>
  )
}
