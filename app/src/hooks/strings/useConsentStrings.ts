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
      'By continuing, you agree to let AIUTA process your photo to perform virtual try-on. Your image will be handled in accordance with our <a href="https://aiuta.com/legal/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, and all uploads must comply with our <a href="https://aiuta.com/legal/terms-of-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>',
    consentButtonAccept: strings?.consentButtonAccept ?? 'Start',
  }
}
