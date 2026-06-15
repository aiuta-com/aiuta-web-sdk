import React from 'react'
import { usePoweredByStrings } from '@/hooks'
import { AiutaLogo } from './AiutaLogo'
import styles from './PoweredBy.module.scss'

/**
 * Purely presentational footer label. Visibility is decided by the callers:
 * the desktop onboarding page and the image-selection state of the
 * standalone QR upload page — nothing else renders it.
 */
export const PoweredBy = () => {
  const { poweredByAiuta } = usePoweredByStrings()

  const url = 'https://www.aiuta.com/'

  return (
    <footer className={styles.poweredBy}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`aiuta-label-footnote ${styles.label}`}
      >
        <span className={styles.text}>{poweredByAiuta}</span>
        <AiutaLogo className={styles.logo} />
      </a>
    </footer>
  )
}
