import { TryOnApiService, type ApiAuthParams } from './tryOnApiService'
import { parseOperationDelays, type OperationDelaysSequence } from './operationDelays'

// Subscription details are loaded once per session and auth: the polling
// config changes rarely, and a failed load just keeps the default delays
let loadedAuthKey: string | null = null
let pending: Promise<OperationDelaysSequence | null> | null = null
let loadedDelays: OperationDelaysSequence | null = null

const authKey = (auth: ApiAuthParams) => `${auth.apiKey ?? ''}|${auth.subscriptionId ?? ''}`

/**
 * Starts loading the operation delays from the backend unless they are
 * already loaded or loading for this auth. Never rejects.
 */
export const prefetchOperationDelays = (
  auth: ApiAuthParams,
): Promise<OperationDelaysSequence | null> => {
  const key = authKey(auth)
  if (pending && loadedAuthKey === key) return pending

  loadedAuthKey = key
  loadedDelays = null
  const request = TryOnApiService.getSubscriptionDetails(auth)
    .then((details) => {
      if (loadedAuthKey === key)
        loadedDelays = parseOperationDelays(details.operation_delays_sequence)
      return loadedDelays
    })
    .catch(() => {
      // Let the next try-on retry the request
      if (pending === request) pending = null
      return null
    })
  pending = request
  return request
}

/**
 * The operation delays loaded for this auth, or null when they are not loaded
 * (yet) and the default sequence applies.
 */
export const getOperationDelays = (auth: ApiAuthParams): OperationDelaysSequence | null =>
  loadedAuthKey === authKey(auth) ? loadedDelays : null
