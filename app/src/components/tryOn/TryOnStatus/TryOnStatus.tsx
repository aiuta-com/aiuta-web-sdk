import React from 'react'
import { TryOnStatusProps } from './types'
import { combineClassNames } from '@/utils/helpers/combineClassNames'
import { useTryOnStrings } from '@/hooks'
import { useAppSelector } from '@/store/store'
import { generationStageSelector } from '@/store/slices/tryOnSlice'
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
    <div className={combineClassNames(styles.tryOnStatus, className)}>
      <span className={styles.spinner} aria-hidden="true" />
      <span>{displayText}</span>
    </div>
  )
}
