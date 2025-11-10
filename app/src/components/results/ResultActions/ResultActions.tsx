import React from 'react'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { SecondaryButton } from '@/components'
import { ResultActionsProps } from './types'
import { useRpc, useShare } from '@/contexts'
import { useShareStrings } from '@/hooks'
import { icons } from './icons'
import styles from './ResultActions.module.scss'

export const ResultActions = (props: ResultActionsProps) => {
  const { activeGeneratedImageUrl } = props
  const rpc = useRpc()
  const { openShareModal } = useShare()
  const { shareButton, downloadButton } = useShareStrings()

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

  return (
    <div className={styles.resultActions}>
      <SecondaryButton
        text={shareButton}
        icon={icons.share}
        shape="M"
        onClick={handleShare}
        classNames={styles.button}
      />
      <SecondaryButton
        text={downloadButton}
        icon={icons.download}
        shape="M"
        onClick={handleDownload}
        classNames={styles.button}
      />
    </div>
  )
}
