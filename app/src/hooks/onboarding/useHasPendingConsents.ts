import { useMemo } from 'react'
import { useRpc } from '@/contexts'
import { useConsentData } from '@/hooks/data'
import { ConsentType } from '@lib/config/features'
import { DEFAULT_CONSENT } from './useConsentManagement'

/**
 * Whether any required consent is still missing for this session.
 *
 * Uses the same effective consent list as `useConsentManagement` (config
 * consents, or the built-in default when none are configured). Shared by the
 * onboarding flow (which rides the consent slide along) and the mobile consent
 * popup that gates the photo upload.
 */
export const useHasPendingConsents = (): boolean => {
  const rpc = useRpc()
  const { data: obtainedConsentIds = [] } = useConsentData()

  const configConsents = rpc.config.features?.consent?.data?.consents

  return useMemo(() => {
    const consents = configConsents?.length ? configConsents : [DEFAULT_CONSENT]
    return consents
      .filter((consent) => consent.type === ConsentType.explicitRequired)
      .some((consent) => !obtainedConsentIds.includes(consent.id))
  }, [configConsents, obtainedConsentIds])
}
