import React from 'react'
import { IconButton } from '@/components'
import { icons } from '../icons'
import styles from '../FullScreenGallery.module.scss'

interface ActionButtonsPanelProps {
  onShare: () => void
  onDownload: () => void
  onDelete?: () => void
  showDelete?: boolean
  /** Dynamic positioning (anchors the column to the image's right edge) */
  style?: React.CSSProperties
}

export const ActionButtonsPanel = ({
  onShare,
  onDownload,
  onDelete,
  showDelete,
  style,
}: ActionButtonsPanelProps) => {
  return (
    <div className={styles.actionButtons} style={style}>
      <IconButton
        icon={icons.share}
        label="Share"
        size={24}
        viewBox="0 0 24 24"
        className={styles.actionButton}
        onClick={onShare}
      />
      <IconButton
        icon={icons.download}
        label="Download"
        size={24}
        viewBox="0 0 21 20"
        className={styles.actionButton}
        onClick={onDownload}
      />
      {showDelete && onDelete && (
        <IconButton
          icon={icons.delete}
          label="Delete"
          size={24}
          viewBox="0 0 24 24"
          className={styles.actionButton}
          onClick={onDelete}
        />
      )}
    </div>
  )
}
