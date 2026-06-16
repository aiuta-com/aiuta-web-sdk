import React, { useEffect, useRef, useState } from 'react'

import { useRpc, useShare, useLogger } from '@/contexts'
import { IconButton, SocialButton, PrimaryButton, RemoteImage, ErrorSnackbar } from '@/components'
import { combineClassNames } from '@/utils'
import { useShareStrings } from '@/hooks'
import { icons } from './icons'
import styles from './Share.module.scss'

// How long the copy button shows "Copied" after a successful copy
const COPIED_RESET_MS = 2000

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
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rpc = useRpc()
  const logger = useLogger()
  const { modalData, animationState, isVisible, closeShareModal } = useShare()
  const { sharePageTitle, copyButton, copiedButton, copyError } = useShareStrings()

  // Drop the "Copied" timer on unmount
  useEffect(() => () => clearTimeout(copiedTimer.current ?? undefined), [])

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
    setCopied(false)
    setCopyFailed(false)
    clearTimeout(copiedTimer.current ?? undefined)
  }

  const handleShare = (shareMethod: ShareMethod) => {
    setHasShared(true)
    sendAnalytics(shareMethod)
  }

  const handleCopyToClipboard = async () => {
    if (modalData?.imageUrl) {
      try {
        // navigator.clipboard is undefined on insecure (http) origins and can be
        // blocked by permissions — both throw and surface the error snackbar
        await navigator.clipboard.writeText(modalData.imageUrl)
        setHasShared(true)
        sendAnalytics('copy')

        // Swap the button to "Copied" for a couple of seconds
        setCopied(true)
        clearTimeout(copiedTimer.current ?? undefined)
        copiedTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
      } catch (error) {
        logger.error('Failed to copy to clipboard:', error)
        setCopyFailed(true)
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
          <IconButton
            icon={icons.close}
            label="Close"
            size={24}
            viewBox="0 0 24 24"
            className={styles.closeButton}
            onClick={handleCloseModal}
          />

          {/* Preview of the image being shared (Figma) */}
          <div className={styles.preview}>
            <RemoteImage src={modalData.imageUrl} alt="Shared result" shape={null} fit="cover" />
          </div>

          <h2 className={combineClassNames('aiuta-page-title', styles.title)}>{sharePageTitle}</h2>

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
              compact
              onClick={handleCopyToClipboard}
              className={styles.copyButton}
            >
              {/* Both labels overlap in one grid cell so the button is sized to
                  the wider of them and never jumps when it swaps (works for any
                  localization, e.g. Copy → OK) */}
              <span className={styles.copyLabel}>
                <span className={copied ? styles.copyLabel_hidden : undefined}>{copyButton}</span>
                <span
                  aria-hidden={!copied}
                  className={copied ? undefined : styles.copyLabel_hidden}
                >
                  {copiedButton}
                </span>
              </span>
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Copy failures (clipboard blocked, e.g. on http) surface here, above
          the modal. Wrapper stops the dismiss tap from closing the modal. */}
      <div onClick={(e) => e.stopPropagation()}>
        <ErrorSnackbar
          open={copyFailed}
          message={copyError}
          onClose={() => setCopyFailed(false)}
        />
      </div>
    </div>
  )
}
