import React from 'react'
import { usePoweredBy } from '@/hooks'
import styles from './PoweredBy.module.scss'

export const PoweredBy = () => {
  const { isVisible, text, url } = usePoweredBy()

  if (!isVisible) {
    return null
  }

  return (
    <footer className={styles.poweredBy}>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.label} aiuta-button-s`}
        >
          {text}
        </a>
      ) : (
        <p className={`${styles.label} aiuta-button-s`}>{text}</p>
      )}
    </footer>
  )
}
