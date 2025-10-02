import React, { useEffect, useCallback } from 'react'
import { useConsentStrings, useConsentManagement } from '@/hooks'
import { ConsentCheckbox } from '@/components/onboarding/ConsentCheckbox'
import { ConsentProps } from './types'
import styles from './Consent.module.scss'

export const Consent = ({ className, onValidationChange }: ConsentProps) => {
  const { consentTitle, consentDescriptionHtml } = useConsentStrings()
  const { checkedConsents, handleConsentChange, consents, areRequiredConsentsGiven, saveConsents } =
    useConsentManagement()

  const containerClasses = [styles.consent, className].filter(Boolean).join(' ')

  // Notify parent about validation state changes
  const notifyValidation = useCallback(() => {
    onValidationChange?.(areRequiredConsentsGiven())
  }, [areRequiredConsentsGiven, onValidationChange])

  useEffect(() => {
    notifyValidation()
  }, [notifyValidation])

  // Save consents when they change
  useEffect(() => {
    // Only save if there are actual checked consents
    const hasCheckedConsents = Object.values(checkedConsents).some(Boolean)
    if (hasCheckedConsents) {
      saveConsents()
    }
  }, [checkedConsents]) // Remove saveConsents from dependencies!

  const renderConsentHtml = (html: string) => {
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className={containerClasses}>
      <h2 className={`aiuta-title-l ${styles.title}`}>{consentTitle}</h2>
      <div className={`aiuta-label-regular ${styles.description}`}>
        {renderConsentHtml(consentDescriptionHtml)}
      </div>

      {consents.map((consent) => (
        <ConsentCheckbox
          key={consent.id}
          consent={consent}
          checked={checkedConsents[consent.id] || false}
          onChange={(checked: boolean) => handleConsentChange(consent.id, checked)}
        />
      ))}
    </div>
  )
}
