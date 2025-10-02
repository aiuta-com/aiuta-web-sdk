import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRpc } from '@/contexts'
import { ConsentStorage } from '@/utils/storage'
import { ConsentType, type Consent } from '@lib/config/features'

// Default consent constant (outside component to avoid recreation)
const DEFAULT_CONSENT: Consent = {
  id: 'main',
  type: ConsentType.explicitRequired,
  html: 'I agree to allow Aiuta to process my photo',
}

/**
 * Hook for managing consent state and validation
 */
export const useConsentManagement = () => {
  const rpc = useRpc()
  const [checkedConsents, setCheckedConsents] = useState<Record<string, boolean>>({})

  const configConsents = useMemo(() => {
    return rpc.config.features?.consent?.data?.consents || []
  }, [rpc.config.features?.consent?.data?.consents])

  const consents = useMemo(() => {
    return configConsents.length > 0 ? configConsents : [DEFAULT_CONSENT]
  }, [configConsents])

  // Initialize consent state from localStorage
  useEffect(() => {
    const obtainedIds = ConsentStorage.getObtainedConsentIds()
    const initialState: Record<string, boolean> = {}

    consents.forEach((consent) => {
      initialState[consent.id] = obtainedIds.includes(consent.id)
    })

    setCheckedConsents(initialState)
  }, [consents, configConsents.length])

  // Handle consent change
  const handleConsentChange = useCallback((consentId: string, checked: boolean) => {
    setCheckedConsents((prev) => ({
      ...prev,
      [consentId]: checked,
    }))
  }, [])

  // Check if all required consents are given
  const areRequiredConsentsGiven = useCallback(() => {
    return consents
      .filter((consent) => consent.type === ConsentType.explicitRequired)
      .every((consent) => checkedConsents[consent.id])
  }, [consents, checkedConsents])

  // Save consents to localStorage
  const saveConsents = useCallback(() => {
    const acceptedIds = Object.entries(checkedConsents)
      .filter(([, checked]) => checked)
      .map(([id]) => id)

    ConsentStorage.setObtainedConsentIds(acceptedIds)
  }, [checkedConsents])

  return {
    checkedConsents,
    handleConsentChange,
    areRequiredConsentsGiven,
    saveConsents,
    hasConsents: true, // Always true since we have default consent
    consents, // Export consents array
  }
}
