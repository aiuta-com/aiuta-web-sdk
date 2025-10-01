import React, { useState, useEffect } from 'react'
import { TryOnStatusProps } from './types'
import { combineClassNames } from '@/utils/helpers/combineClassNames'
import { Icon } from '@/components/ui/Icon'
import { useTryOnStrings } from '@/hooks'
import { icons } from './icons'
import styles from './TryOnStatus.module.scss'

export const TryOnStatus = ({ stage, className }: TryOnStatusProps) => {
  const { tryOnLoadingStatusScanningBody, tryOnLoadingStatusGeneratingOutfit } = useTryOnStrings()
  const [displayText, setDisplayText] = useState(tryOnLoadingStatusScanningBody)

  useEffect(() => {
    if (stage === 'scanning') {
      setDisplayText(tryOnLoadingStatusScanningBody)
      const timer = setTimeout(() => {
        setDisplayText(tryOnLoadingStatusGeneratingOutfit)
      }, 4000)
      return () => clearTimeout(timer)
    } else if (stage === 'generating') {
      setDisplayText(tryOnLoadingStatusGeneratingOutfit)
    }
  }, [stage, tryOnLoadingStatusScanningBody, tryOnLoadingStatusGeneratingOutfit])

  return (
    <div className={combineClassNames('aiuta-button-s', styles.tryOnStatus, className)}>
      <Icon icon={icons.spinner} size={22} className={styles.spinner} />
      <span className={styles.statusText}>{displayText}</span>
    </div>
  )
}
