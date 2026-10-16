import { beforeEach, describe, expect, it, vi } from 'vitest'

// tryOnApiService reads a build-time global, so the API is mocked as a whole
const getSubscriptionDetails = vi.fn()
vi.mock('./tryOnApiService', () => ({
  TryOnApiService: { getSubscriptionDetails },
}))

const auth = { apiKey: 'key-1' }
const delays = [{ mode: 'infinite', delay: 2 }]

// The cache is module state, so every test gets a fresh module
const load = () => import('./subscriptionDetails')

describe('subscription details cache', () => {
  beforeEach(() => {
    vi.resetModules()
    getSubscriptionDetails.mockReset()
  })

  it('has no delays before they are loaded', async () => {
    const { getOperationDelays } = await load()
    expect(getOperationDelays(auth)).toBeNull()
  })

  it('loads the delays once for concurrent prefetches', async () => {
    getSubscriptionDetails.mockResolvedValue({ operation_delays_sequence: delays })
    const { prefetchOperationDelays, getOperationDelays } = await load()

    await Promise.all([prefetchOperationDelays(auth), prefetchOperationDelays(auth)])
    await prefetchOperationDelays(auth)

    expect(getSubscriptionDetails).toHaveBeenCalledTimes(1)
    expect(getOperationDelays(auth)).toEqual(delays)
  })

  it('keeps the default when the backend has no delays', async () => {
    getSubscriptionDetails.mockResolvedValue({})
    const { prefetchOperationDelays, getOperationDelays } = await load()

    await prefetchOperationDelays(auth)
    expect(getOperationDelays(auth)).toBeNull()
  })

  it('never rejects, and retries a failed load on the next prefetch', async () => {
    getSubscriptionDetails
      .mockRejectedValueOnce(new Error('401'))
      .mockResolvedValueOnce({ operation_delays_sequence: delays })
    const { prefetchOperationDelays, getOperationDelays } = await load()

    await expect(prefetchOperationDelays(auth)).resolves.toBeNull()
    expect(getOperationDelays(auth)).toBeNull()

    await prefetchOperationDelays(auth)
    expect(getSubscriptionDetails).toHaveBeenCalledTimes(2)
    expect(getOperationDelays(auth)).toEqual(delays)
  })

  it('reloads for another auth and does not leak delays between them', async () => {
    getSubscriptionDetails
      .mockResolvedValueOnce({ operation_delays_sequence: delays })
      .mockResolvedValueOnce({})
    const { prefetchOperationDelays, getOperationDelays } = await load()
    const otherAuth = { subscriptionId: 'subscription-2' }

    await prefetchOperationDelays(auth)
    await prefetchOperationDelays(otherAuth)

    expect(getSubscriptionDetails).toHaveBeenCalledTimes(2)
    expect(getOperationDelays(otherAuth)).toBeNull()
    expect(getOperationDelays(auth)).toBeNull()
  })
})
