import React from 'react'
import { useAppSelector } from '@/store/store'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { SecondaryButton } from '@/components'
import { DesktopResultActionsProps } from './types'
import { useRpc } from '@/contexts'
import styles from './DesktopResultActions.module.scss'

export const DesktopResultActions = (props: DesktopResultActionsProps) => {
  const { activeGeneratedImageUrl } = props
  const rpc = useRpc()

  const productId = useAppSelector(productIdSelector)

  const handleShare = async () => {
    // TODO: Replace with RPC call to SDK
    // await rpc.sdk.openShareModal({
    //   imageUrl: activeGeneratedImageUrl
    // })

    // Legacy messaging removed, implement RPC method openShareModal
    console.warn('Share modal opening: implement RPC method openShareModal')

    const analytic = {
      data: {
        type: 'share',
        event: 'initiated',
        pageId: 'results',
        productIds: [productId],
      },
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
      data: {
        type: 'share',
        event: 'downloaded',
        pageId: 'results',
        productIds: [productId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  return (
    <div className={styles.desktopResultActions}>
      <SecondaryButton text="Share" iconUrl="./icons/share.svg" onClick={handleShare} />
      <SecondaryButton text="Download" iconUrl="./icons/download.svg" onClick={handleDownload} />
    </div>
  )
}
