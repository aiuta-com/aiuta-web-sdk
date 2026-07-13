import type { ApiAuthParams } from './tryOnApiService'
import type { AiutaAuth } from '@lib/config'

/**
 * Maps the SDK auth config into plain request auth params
 * (x-api-key / x-user-id headers)
 */
export function getAuthParams(auth: AiutaAuth): ApiAuthParams {
  return {
    apiKey: 'apiKey' in auth ? auth.apiKey : undefined,
    subscriptionId: 'subscriptionId' in auth ? auth.subscriptionId : undefined,
  }
}
