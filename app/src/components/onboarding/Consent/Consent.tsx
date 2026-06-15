import React, { useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useConsentStrings, useConsentManagement } from '@/hooks'
import { ConsentCheckbox } from '@/components/onboarding/ConsentCheckbox'
import { ConsentProps, ConsentHandle } from './types'
import styles from './Consent.module.scss'

export const Consent = forwardRef<ConsentHandle, ConsentProps>(
  ({ className, onValidationChange, compact, autoSave = true }, ref) => {
    const { consentTitle, consentDescriptionHtml } = useConsentStrings()
    const {
      checkedConsents,
      handleConsentChange,
      consents,
      areRequiredConsentsGiven,
      saveConsents,
    } = useConsentManagement()

    const containerClasses = [styles.consent, compact && styles.consent_compact, className]
      .filter(Boolean)
      .join(' ')

    // Let the parent persist the current selection on demand (e.g. on confirm)
    useImperativeHandle(ref, () => ({ save: saveConsents }), [saveConsents])

    // Notify parent about validation state changes
    const notifyValidation = useCallback(() => {
      onValidationChange?.(areRequiredConsentsGiven())
    }, [areRequiredConsentsGiven, onValidationChange])

    useEffect(() => {
      notifyValidation()
    }, [notifyValidation])

    // Save consents when they change (opt-out for deferred-save callers)
    useEffect(() => {
      if (!autoSave) return
      // Only save if there are actual checked consents
      const hasCheckedConsents = Object.values(checkedConsents).some(Boolean)
      if (hasCheckedConsents) {
        saveConsents()
      }
    }, [checkedConsents, autoSave]) // Remove saveConsents from dependencies!

    const renderConsentHtml = (html: string) => {
      return <div dangerouslySetInnerHTML={{ __html: html }} />
    }

    return (
      <div className={containerClasses}>
        <h2 className={`${compact ? 'aiuta-title-m' : 'aiuta-title-l'} ${styles.title}`}>
          {consentTitle}
        </h2>
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
  },
)

Consent.displayName = 'Consent'
