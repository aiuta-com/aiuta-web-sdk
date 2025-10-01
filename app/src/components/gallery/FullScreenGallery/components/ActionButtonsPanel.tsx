import React from 'react'
import { IconButton } from '@/components'
import { icons } from '../icons'
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
      <IconButton
        icon={icons.share}
        label="Share"
        size={28}
        viewBox="0 0 28 28"
        className={styles.actionButton}
        onClick={onShare}
      />
      <IconButton
        icon={icons.download}
        label="Download"
        size={28}
        viewBox="0 0 28 28"
        className={styles.actionButton}
        onClick={onDownload}
      />
      {showDelete && onDelete && (
        <IconButton
          icon={icons.delete}
          label="Delete"
          size={28}
          viewBox="0 0 28 28"
          className={styles.actionButton}
          onClick={onDelete}
        />
      )}
    </div>
  )
}
