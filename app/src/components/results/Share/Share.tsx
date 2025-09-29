import React, { useState, useEffect } from 'react'

// TODO: Replace with RPC - need to support modal opening from SDK
// Required data: { imageUrl: string }
// RPC method needed: openShareModal(data: { imageUrl: string })
import { useRpc } from '@/contexts'
import { useAppVisibility } from '@/hooks'
import styles from './Share.module.scss'

interface ShareData {
  imageUrl: string
}

interface ShareButton {
  id: string
  href?: string
  iconSrc: string
  shareMethod: 'whatsApp' | 'messenger' | 'copy'
}

type ShareMethod = 'whatsApp' | 'messenger' | 'copy'

interface ShareProps {
  imageUrl?: string
  onClose?: () => void
}

export const Share = ({ imageUrl, onClose }: ShareProps) => {
  const [modalData, setModalData] = useState<ShareData | null>(null)
  const [hasShared, setHasShared] = useState(false)
  const rpc = useRpc()
  const { hideApp } = useAppVisibility()

  // Use props if provided, otherwise listen for messages (for standalone usage)
  useEffect(() => {
    if (imageUrl) {
      setModalData({ imageUrl })
      setHasShared(false)
    } else {
      // Listen for share modal messages (for standalone usage)
      const handleMessage = (event: MessageEvent) => {
        // TODO: Replace with RPC event - event.data?.action === 'openShareModal'
        if (event.data?.action === 'OPEN_AIUTA_SHARE_MODAL') {
          setModalData(event.data.data)
          setHasShared(false)
        }
      }

      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }
  }, [imageUrl])

  const shareButtons: ShareButton[] = [
    {
      id: 'whatsapp-share',
      href: modalData ? 'https://wa.me/?text=${modalData.imageUrl}' : undefined,
      iconSrc: './icons/whatsapp.svg',
      shareMethod: 'whatsApp',
    },
    {
      id: 'messenger-share',
      href: modalData ? 'https://www.messenger.com/new?text=${modalData.imageUrl}' : undefined,
      iconSrc: './icons/messenger.svg',
      shareMethod: 'messenger',
    },
  ]

  const handleCloseModal = () => {
    if (!hasShared) {
      sendCancelAnalytics()
    }
    setModalData(null)
    setHasShared(false)

    // Use onClose prop if provided, otherwise hide widget
    if (onClose) {
      onClose()
    } else {
      hideApp()
    }
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
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }

  const sendAnalytics = (shareMethod: ShareMethod) => {
    const analytic = {
      data: {
        type: 'share',
        event: 'succeded',
        pageId: 'results',
        targetId: shareMethod,
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  const sendCancelAnalytics = () => {
    const analytic = {
      data: {
        type: 'share',
        event: 'canceled',
        pageId: 'results',
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  if (!modalData) {
    return null
  }

  return (
    <div className={styles.share} onClick={handleCloseModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <img src="./icons/shareWithText.svg" alt="Share with" className={styles.title} />

        <img
          src="./icons/close.svg"
          alt="Close"
          className={styles.closeButton}
          onClick={handleCloseModal}
        />

        <div className={styles.shareButtons}>
          {shareButtons.map((button) => (
            <a
              key={button.id}
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shareButton}
              onClick={() => handleShare(button.shareMethod)}
            >
              <img src={button.iconSrc} alt={'Share via ${button.shareMethod}'} />
            </a>
          ))}
        </div>

        <div className={styles.copySection}>
          <p className={styles.urlText}>{modalData.imageUrl}</p>
          <img
            src="./icons/copyButton.svg"
            alt="Copy"
            className={styles.copyButton}
            onClick={handleCopyToClipboard}
          />
        </div>
      </div>
    </div>
  )
}
