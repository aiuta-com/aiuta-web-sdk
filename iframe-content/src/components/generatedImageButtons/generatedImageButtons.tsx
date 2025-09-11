import React from 'react'

// redux
import { useAppSelector } from '@lib/redux/store'

// selectors
import { aiutaEndpointDataSelector } from '@lib/redux/slices/configSlice/selectors'

// components
import { SecondaryButton } from '@/components'

// types
import { GeneratedImageButtonsTypes } from './types'

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

// rpc
import { useRpcProxy } from '@/contexts'

// styles
import styles from './generatedImageButtons.module.scss'

export const GeneratedImageButtons = (props: GeneratedImageButtonsTypes) => {
  const { activeGeneratedImageUrl } = props
  const rpc = useRpcProxy()

  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector)

  const handleShare = async () => {
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.OPEN_SHARE_MODAL,
      data: { imageUrl: activeGeneratedImageUrl },
    })

    const analytic = {
      data: {
        type: 'share',
        event: 'initiated',
        pageId: 'results',
        productIds: [aiutaEndpointData.skuId],
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
        event: 'donwloaded',
        pageId: 'results',
        productIds: [aiutaEndpointData.skuId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  return (
    <div className={`${styles.generatedImageButtons} `}>
      <SecondaryButton text="Share" onClick={handleShare} />
      <SecondaryButton text="Download" onClick={handleDownload} />
    </div>
  )
}
