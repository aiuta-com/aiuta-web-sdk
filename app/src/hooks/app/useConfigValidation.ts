import { useEffect, useState } from 'react'
import { useRpc } from '@/contexts'
import { useLogger } from '@/contexts/LoggerContext'

interface ConfigValidationResult {
  isValidating: boolean
  isConfigValid: boolean
  configError: string | null
}

/**
 * Validates SDK configuration on app startup
 *
 * Current validations:
 * - Auth credentials (apiKey or subscriptionId must be provided and non-empty)
 *
 * Future validations can be added here:
 * - Product IDs format
 * - Feature flags consistency
 * - URL configurations
 * etc.
 */
export function useConfigValidation(): ConfigValidationResult {
  const rpc = useRpc()
  const logger = useLogger()
  const [result, setResult] = useState<ConfigValidationResult>({
    isValidating: true,
    isConfigValid: false,
    configError: null,
  })

  useEffect(() => {
    if (!rpc) return

    const auth = rpc.config.auth
    const apiKey = 'apiKey' in auth ? auth.apiKey : undefined
    const subscriptionId = 'subscriptionId' in auth ? auth.subscriptionId : undefined

    // Validate auth credentials
    const hasApiKey = apiKey && apiKey.length > 0
    const hasSubscriptionId = subscriptionId && subscriptionId.length > 0

    if (!hasApiKey && !hasSubscriptionId) {
      const errorMessage =
        'Invalid auth configuration: either apiKey or subscriptionId must be provided and non-empty'
      logger.error('[useConfigValidation]', errorMessage, {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length ?? 0,
        hasSubscriptionId: !!subscriptionId,
        subscriptionIdLength: subscriptionId?.length ?? 0,
      })

      setResult({
        isValidating: false,
        isConfigValid: false,
        configError: errorMessage,
      })
      return
    }

    // All validations passed
    logger.info('[useConfigValidation] Configuration is valid')
    setResult({
      isValidating: false,
      isConfigValid: true,
      configError: null,
    })
  }, [rpc, logger])

  return result
}
