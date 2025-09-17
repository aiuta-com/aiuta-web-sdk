import React from 'react'
import { usePoweredBy } from '@/hooks'
import styles from './PoweredBy.module.scss'

export const PoweredBy = () => {
  const { isVisible, text, url } = usePoweredBy()

  if (!isVisible) {
    return null
  }

  return (
    <div className={styles.poweredBy}>
      <p className={styles.text}>
        {url ? (
          <>
            Powered{' '}
            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
              by Aiuta
            </a>
          </>
        ) : (
          text
        )}
      </p>
    </div>
  )
}
