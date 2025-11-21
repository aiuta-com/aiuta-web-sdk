import { useCallback } from 'react'
import { useAlert } from '@/contexts'
import { useDisclaimerStrings } from '@/hooks'

/**
 * Hook for showing fit disclaimer alert
 */
export const useDisclaimer = () => {
  const { fitDisclaimerDescription, fitDisclaimerCloseButton } = useDisclaimerStrings()
  const { showAlert } = useAlert()

  const showDisclaimer = useCallback(() => {
    showAlert(fitDisclaimerDescription, fitDisclaimerCloseButton)
  }, [showAlert, fitDisclaimerDescription, fitDisclaimerCloseButton])

  return { showDisclaimer }
}
