import React from 'react'
import { TryOnStatusProps } from './types'
import { combineClassNames } from '@/utils/helpers/combineClassNames'
import { Icon } from '@/components/ui/Icon'
import { useTryOnStrings } from '@/hooks'
import { useAppSelector } from '@/store/store'
import { generationStageSelector } from '@/store/slices/tryOnSlice'
import { icons } from './icons'
import styles from './TryOnStatus.module.scss'

export const TryOnStatus = ({ className }: TryOnStatusProps) => {
  const {
    tryOnLoadingStatusUploadingImage,
    tryOnLoadingStatusScanningBody,
    tryOnLoadingStatusGeneratingOutfit,
  } = useTryOnStrings()

  const generationStage = useAppSelector(generationStageSelector)

  // Map stage to display text
  const displayText =
    generationStage === 'uploading'
      ? tryOnLoadingStatusUploadingImage
      : generationStage === 'scanning'
        ? tryOnLoadingStatusScanningBody
        : generationStage === 'generating'
          ? tryOnLoadingStatusGeneratingOutfit
          : tryOnLoadingStatusScanningBody

  return (
    <div className={combineClassNames('aiuta-button-s', styles.tryOnStatus, className)}>
      <Icon icon={icons.spinner} size={22} className={styles.spinner} />
      <span className={styles.statusText}>{displayText}</span>
    </div>
  )
}
