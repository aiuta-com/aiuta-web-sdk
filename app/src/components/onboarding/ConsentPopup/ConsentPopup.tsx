import React, { useCallback, useRef, useState } from 'react'
import { Consent } from '@/components/onboarding/Consent'
import type { ConsentHandle } from '@/components/onboarding/Consent/types'
import { PrimaryButton } from '@/components/buttons/PrimaryButton'
import { useConsentStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import type { ConsentPopupProps } from './types'
import styles from './ConsentPopup.module.scss'

/**
 * Mobile-only consent popup (Figma 12677-50839). Holds the same consent UI as
 * the onboarding slide — title, description and the required-consent checkbox —
 * but in a floating card triggered by the photo upload instead of a slide.
 * The Start button stays disabled until the required consents are checked;
 * pressing it resumes the upload that opened the popup (see useConsentGate).
 */
export const ConsentPopup = ({ isOpen, onClose, onConfirm }: ConsentPopupProps) => {
  const { consentButtonAccept } = useConsentStrings()
  const [isValid, setIsValid] = useState(false)
  const consentRef = useRef<ConsentHandle>(null)

  const handleOverlayClick = useCallback(() => onClose(), [onClose])
  const handleCardClick = useCallback((event: React.MouseEvent) => event.stopPropagation(), [])

  // Persist the consent only on confirm — closing the popup after toggling a
  // box must not count as accepted
  const handleConfirm = useCallback(() => {
    consentRef.current?.save()
    onConfirm()
  }, [onConfirm])

  return (
    <div
      className={combineClassNames(styles.overlay, isOpen && styles.overlay_active)}
      onClick={handleOverlayClick}
      data-testid="aiuta-consent-popup"
    >
      <div className={styles.card} onClick={handleCardClick}>
        <Consent ref={consentRef} compact autoSave={false} onValidationChange={setIsValid} />
        <div className={styles.footer}>
          <PrimaryButton
            disabled={!isValid}
            onClick={handleConfirm}
            maxWidth={false}
            className={styles.startButton}
          >
            {consentButtonAccept}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
