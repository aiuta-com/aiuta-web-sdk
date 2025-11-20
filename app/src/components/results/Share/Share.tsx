import React, { useState } from 'react'

import { useRpc, useShare, useLogger } from '@/contexts'
import { IconButton, SocialButton, PrimaryButton } from '@/components'
import { combineClassNames } from '@/utils'
import { useShareStrings } from '@/hooks'
import { icons } from './icons'
import styles from './Share.module.scss'

interface ShareButton {
  id: string
  href?: string
  icon: string
  title: string
  shareMethod: 'whatsApp' | 'messenger' | 'copy'
}

type ShareMethod = 'whatsApp' | 'messenger' | 'copy'

export const Share = () => {
  const [hasShared, setHasShared] = useState(false)
  const rpc = useRpc()
  const logger = useLogger()
  const { modalData, animationState, isVisible, closeShareModal } = useShare()
  const { sharePageTitle, copyButton } = useShareStrings()

  const shareButtons: ShareButton[] = [
    {
      id: 'whatsapp-share',
      href: modalData ? `https://wa.me/?text=${modalData.imageUrl}` : undefined,
      icon: icons.whatsapp,
      title: 'WhatsApp',
      shareMethod: 'whatsApp',
    },
    {
      id: 'messenger-share',
      href: modalData ? `https://www.messenger.com/new?text=${modalData.imageUrl}` : undefined,
      icon: icons.messenger,
      title: 'Messenger',
      shareMethod: 'messenger',
    },
  ]

  const handleCloseModal = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!hasShared) {
      sendCancelAnalytics()
    }
    closeShareModal()
    setHasShared(false)
  }

  const handleShare = (shareMethod: ShareMethod) => {
    setHasShared(true)
    sendAnalytics(shareMethod)
  }

  const handleCopyToClipboard = async () => {
    if (modalData?.imageUrl) {
      try {
        await navigator.clipboard.writeText(modalData.imageUrl)
        setHasShared(true)
        sendAnalytics('copy')
      } catch (error) {
        logger.error('Failed to copy to clipboard:', error)
      }
    }
  }

  const sendAnalytics = (shareMethod: ShareMethod) => {
    const analytic = {
      type: 'share',
      event: 'succeeded',
      pageId: 'results',
      targetId: shareMethod,
    }

    rpc.sdk.trackEvent(analytic)
  }

  const sendCancelAnalytics = () => {
    const analytic = {
      type: 'share',
      event: 'canceled',
      pageId: 'results',
    }

    rpc.sdk.trackEvent(analytic)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={combineClassNames(styles.share, styles[`share_${animationState}`])}
      onClick={handleCloseModal}
      data-testid="aiuta-share-modal"
    >
      {modalData && (
        <div
          className={combineClassNames('aiuta-modal', styles.modal)}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="aiuta-page-title">{sharePageTitle}</h2>

          <IconButton
            icon={icons.close}
            label="Close"
            size={24}
            viewBox="0 0 24 24"
            className={styles.closeButton}
            onClick={handleCloseModal}
          />

          <div className={styles.shareButtons}>
            {shareButtons.map((button) => (
              <SocialButton
                key={button.id}
                icon={button.icon}
                title={button.title}
                href={button.href}
                onClick={() => handleShare(button.shareMethod)}
              />
            ))}
          </div>

          <div className={styles.copySection}>
            <p className={styles.urlText}>{modalData.imageUrl}</p>
            <PrimaryButton
              shape="S"
              maxWidth={false}
              onClick={handleCopyToClipboard}
              className={styles.copyButton}
            >
              {copyButton}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}
