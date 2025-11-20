import React from 'react'
import { Icon } from '@/components'
import { icons } from './icons'
import styles from './ConfigError.module.scss'

interface ConfigErrorProps {
  error: string | null
}

/**
 * Configuration error screen
 * Displayed when SDK configuration is invalid (e.g., missing auth credentials)
 */
export function ConfigError({ error }: ConfigErrorProps) {
  return (
    <div className={styles.configError}>
      <div className={styles.content}>
        <Icon icon={icons.warning} size={48} viewBox="0 0 36 36" className={styles.icon} />
        <p className={'aiuta-title-m'}>Configuration Error</p>
        {error && <p className={'aiuta-label-subtle'}>{error}</p>}
      </div>
    </div>
  )
}
