import React, { useState, useEffect } from 'react'
import { TryOnStatusProps } from './types'
import { combineClassNames } from '@/utils/helpers/combineClassNames'
import { Icon } from '@/components/ui/Icon'
import { icons } from './icons'
import styles from './TryOnStatus.module.scss'

export const TryOnStatus = ({ stage, className }: TryOnStatusProps) => {
  const [displayText, setDisplayText] = useState('Scanning your body')

  useEffect(() => {
    if (stage === 'scanning') {
      setDisplayText('Scanning your body')
      const timer = setTimeout(() => {
        setDisplayText('Generating outfit')
      }, 4000)
      return () => clearTimeout(timer)
    } else if (stage === 'generating') {
      setDisplayText('Generating outfit')
    }
  }, [stage])

  return (
    <div className={combineClassNames('aiuta-button-s', styles.tryOnStatus, className)}>
      <Icon icon={icons.spinner} size={22} className={styles.spinner} />
      <span className={styles.statusText}>{displayText}</span>
    </div>
  )
}
