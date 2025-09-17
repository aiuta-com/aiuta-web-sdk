import React, { useState, useEffect } from 'react'
import { ProcessingStatusProps } from './types'
import styles from './ProcessingStatus.module.scss'

export const ProcessingStatus = ({ isVisible, stage, className }: ProcessingStatusProps) => {
  const [displayText, setDisplayText] = useState('Scanning your body')

  useEffect(() => {
    if (stage === 'scanning') {
      setDisplayText('Scanning your body')
      // Switch to generation text after 2 seconds
      const timer = setTimeout(() => {
        setDisplayText('Generating outfit')
      }, 2000)
      return () => clearTimeout(timer)
    } else if (stage === 'generating') {
      setDisplayText('Generating outfit')
    }
  }, [stage])

  if (!isVisible) {
    return null
  }

  return (
    <div className={`${styles.processingStatus} ${className || ''}`}>
      <div className={styles.spinner}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className={styles.spinnerDot}>
            <span className={styles.hiddenText}>Loading...</span>
          </div>
        ))}
      </div>
      <span className={styles.statusText}>{displayText}</span>
    </div>
  )
}
