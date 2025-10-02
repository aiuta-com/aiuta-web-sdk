import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Consent feature strings with fallbacks
 */
export const useConsentStrings = () => {
  const rpc = useRpc()

  const strings = rpc.config.features?.consent?.strings

  return {
    consentTitle: strings?.consentTitle ?? 'Consent',
    consentDescriptionHtml:
      strings?.consentDescriptionHtml ??
      'In order to try on items digitally, you agree to allow Aiuta to process your photo. Your data will be processed according to the Aiuta <a href="https://aiuta.com/legal/terms-of-service.html" target="_blank" rel="noopener noreferrer">Terms of Use</a>',
    consentButtonAccept: strings?.consentButtonAccept ?? 'Accept',
  }
}
