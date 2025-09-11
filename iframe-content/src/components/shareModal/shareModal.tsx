import React, { useState, useEffect } from 'react'
import { MESSAGE_ACTIONS } from '@shared/messaging'
import { useRpcProxy } from '@/contexts'
import {
  MESSENGER,
  WHATS_APP,
  CLOSE_ICON,
  COPY_BUTTON,
  SHARE_WITH_TEXT,
} from '@/constants/socialIcons'
import styles from './shareModal.module.scss'

interface ShareModalData {
  imageUrl: string
}

interface ShareButton {
  id: string
  href?: string
  icon: string
  shareMethod: 'whatsApp' | 'messenger' | 'copy'
}

type ShareMethod = 'whatsApp' | 'messenger' | 'copy'

interface ShareModalProps {
  imageUrl?: string
  onClose?: () => void
}

export const ShareModal: React.FC<ShareModalProps> = ({ imageUrl, onClose }) => {
  const [modalData, setModalData] = useState<ShareModalData | null>(null)
  const [hasShared, setHasShared] = useState(false)
  const rpc = useRpcProxy()

  // Use props if provided, otherwise listen for messages (for standalone usage)
  useEffect(() => {
    if (imageUrl) {
      setModalData({ imageUrl })
      setHasShared(false)
    } else {
      // Listen for share modal messages (for standalone usage)
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.action === MESSAGE_ACTIONS.OPEN_AIUTA_SHARE_MODAL) {
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
      href: modalData ? `https://wa.me/?text=${modalData.imageUrl}` : undefined,
      icon: WHATS_APP,
      shareMethod: 'whatsApp',
    },
    {
      id: 'messenger-share',
      href: modalData ? `https://www.messenger.com/new?text=${modalData.imageUrl}` : undefined,
      icon: MESSENGER,
      shareMethod: 'messenger',
    },
  ]

  const handleCloseModal = () => {
    if (!hasShared) {
      sendCancelAnalytics()
    }
    setModalData(null)
    setHasShared(false)

    // Use onClose prop if provided, otherwise notify parent to close the modal iframe
    if (onClose) {
      onClose()
    } else {
      rpc.sdk.closeModal()
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
    <div className={styles.shareModal} onClick={handleCloseModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <p className={styles.title} dangerouslySetInnerHTML={{ __html: SHARE_WITH_TEXT }} />

        <div
          className={styles.closeButton}
          onClick={handleCloseModal}
          dangerouslySetInnerHTML={{ __html: CLOSE_ICON }}
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
              dangerouslySetInnerHTML={{ __html: button.icon }}
            />
          ))}
        </div>

        <div className={styles.copySection}>
          <p className={styles.urlText}>{modalData.imageUrl}</p>
          <div
            className={styles.copyButton}
            onClick={handleCopyToClipboard}
            dangerouslySetInnerHTML={{ __html: COPY_BUTTON }}
          />
        </div>
      </div>
    </div>
  )
}
