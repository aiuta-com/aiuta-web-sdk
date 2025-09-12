import React from 'react'
import styles from './resultsGallery.module.scss'

interface ShareButtonProps {
  onShare: () => void
  className?: string
}

/**
 * Share button component for results
 */
export const ShareButton: React.FC<ShareButtonProps> = ({ onShare, className }) => {
  return (
    <div className={`${styles.shareBox} ${className || ''}`} onClick={onShare}>
      <img src={'./icons/shareMobile.svg'} alt="Share icon" className={styles.shareIcon} />
    </div>
  )
}
