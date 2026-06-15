import React from 'react'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { Icon } from '@/components'
import { ResultActionsProps } from './types'
import { useRpc, useShare } from '@/contexts'
import { useShareStrings, useImagePickerStrings, useTryOnWithOtherPhoto } from '@/hooks'
import { combineClassNames } from '@/utils'
import { icons } from './icons'
import styles from './ResultActions.module.scss'

export const ResultActions = (props: ResultActionsProps) => {
  const { activeGeneratedImageUrl } = props
  const rpc = useRpc()
  const { openShareModal } = useShare()
  const { shareButton, downloadButton } = useShareStrings()
  const { uploadsHistoryButtonChangePhoto } = useImagePickerStrings()
  const {
    isEnabled: isOtherPhotoEnabled,
    icon: changePhotoIcon,
    handleClick: handleChangePhoto,
  } = useTryOnWithOtherPhoto()

  const productIds = useAppSelector(productIdsSelector)

  const handleShare = async () => {
    if (!activeGeneratedImageUrl) return

    // Open share modal
    openShareModal(activeGeneratedImageUrl)

    // Track analytics
    const analytic = {
      type: 'share',
      event: 'initiated',
      pageId: 'results',
      productIds,
    }

    rpc.sdk.trackEvent(analytic)
  }

  const handleDownload = async () => {
    if (activeGeneratedImageUrl) {
      const response = await fetch(activeGeneratedImageUrl, { mode: 'cors' })
      const blob = await response.blob()

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = blobUrl
      link.download = `try-on-${Date.now()}`
      document.body.appendChild(link)

      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    }

    const analytic = {
      type: 'share',
      event: 'downloaded',
      pageId: 'results',
      productIds,
    }

    rpc.sdk.trackEvent(analytic)
  }

  const tileClassName = combineClassNames('aiuta-button-s', styles.actionTile)

  return (
    <div className={styles.resultActions}>
      <button className={tileClassName} onClick={handleShare}>
        <Icon icon={icons.share} size={20} viewBox="0 0 24 24" />
        <span>{shareButton}</span>
      </button>
      <button className={tileClassName} onClick={handleDownload}>
        <Icon icon={icons.download} size={20} viewBox="0 0 21 20" />
        <span>{downloadButton}</span>
      </button>
      {isOtherPhotoEnabled && (
        <button className={tileClassName} onClick={handleChangePhoto}>
          <Icon icon={changePhotoIcon || icons.changePhoto} size={20} viewBox="0 0 24 24" />
          <span>{uploadsHistoryButtonChangePhoto}</span>
        </button>
      )}
    </div>
  )
}
