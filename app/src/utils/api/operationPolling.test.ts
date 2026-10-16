import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startOperationPolling } from './operationPolling'

type Status = 'IN_PROGRESS' | 'SUCCESS'

const delaysOf = (...delays: number[]) => delays[Symbol.iterator]()

// A request whose responses the test sends explicitly, to control timing
const deferredRequest = () => {
  const resolvers: Array<(status: Status) => void> = []
  const request = vi.fn(() => new Promise<Status>((resolve) => resolvers.push(resolve)))
  const respond = async (status: Status) => {
    resolvers.shift()?.(status)
    await vi.advanceTimersByTimeAsync(0)
  }
  return { request, respond }
}

const isSettled = (status: Status) => status === 'SUCCESS'

describe('startOperationPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits each delay before polling', async () => {
    const request = vi.fn().mockResolvedValue('IN_PROGRESS')
    startOperationPolling({
      delays: delaysOf(1, 0.5),
      request,
      handle: isSettled,
      onTimeout: vi.fn(),
    })

    await vi.advanceTimersByTimeAsync(999)
    expect(request).toHaveBeenCalledTimes(0)
    await vi.advanceTimersByTimeAsync(1)
    expect(request).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(499)
    expect(request).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('starts the next delay only after the response, so polls never overlap', async () => {
    const { request, respond } = deferredRequest()
    startOperationPolling({
      delays: delaysOf(1, 1, 1),
      request,
      handle: isSettled,
      onTimeout: vi.fn(),
    })

    await vi.advanceTimersByTimeAsync(1000)
    expect(request).toHaveBeenCalledTimes(1)

    // The response takes 5s: no other poll meanwhile
    await vi.advanceTimersByTimeAsync(5000)
    expect(request).toHaveBeenCalledTimes(1)

    await respond('IN_PROGRESS')
    await vi.advanceTimersByTimeAsync(999)
    expect(request).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('handles each response and stops once the operation is settled', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce('IN_PROGRESS')
      .mockResolvedValueOnce('SUCCESS')
      .mockResolvedValue('SUCCESS')
    const handle = vi.fn(isSettled)
    const onTimeout = vi.fn()
    startOperationPolling({ delays: delaysOf(1, 1, 1, 1), request, handle, onTimeout })

    await vi.advanceTimersByTimeAsync(10_000)
    expect(request).toHaveBeenCalledTimes(2)
    expect(handle.mock.calls).toEqual([['IN_PROGRESS'], ['SUCCESS']])
    expect(onTimeout).not.toHaveBeenCalled()
  })

  it('times out when the delays run out before the operation settled', async () => {
    const request = vi.fn().mockResolvedValue('IN_PROGRESS')
    const onTimeout = vi.fn()
    startOperationPolling({ delays: delaysOf(1, 1), request, handle: isSettled, onTimeout })

    await vi.advanceTimersByTimeAsync(1000)
    expect(onTimeout).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(request).toHaveBeenCalledTimes(2)
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('reports a failed request and retries it with the next delay', async () => {
    const error = new Error('network')
    const request = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('SUCCESS')
    const onError = vi.fn()
    startOperationPolling({
      delays: delaysOf(1, 1, 1),
      request,
      handle: isSettled,
      onError,
      onTimeout: vi.fn(),
    })

    await vi.advanceTimersByTimeAsync(10_000)
    expect(onError).toHaveBeenCalledWith(error)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('does not poll after being stopped during a delay', async () => {
    const request = vi.fn().mockResolvedValue('IN_PROGRESS')
    const polling = startOperationPolling({
      delays: delaysOf(1, 1),
      request,
      handle: isSettled,
      onTimeout: vi.fn(),
    })

    await vi.advanceTimersByTimeAsync(500)
    polling.stop()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(request).not.toHaveBeenCalled()
  })

  it('drops a response that arrives after stop, so a newer operation is not affected', async () => {
    // Operation A's poll is in flight when operation B replaces it
    const oldOperation = deferredRequest()
    const handleOld = vi.fn(isSettled)
    const onTimeoutOld = vi.fn()
    const pollingA = startOperationPolling({
      delays: delaysOf(1, 1),
      request: oldOperation.request,
      handle: handleOld,
      onTimeout: onTimeoutOld,
    })
    await vi.advanceTimersByTimeAsync(1000)
    expect(oldOperation.request).toHaveBeenCalledTimes(1)

    pollingA.stop()
    const handleNew = vi.fn(isSettled)
    const requestNew = vi.fn().mockResolvedValue('IN_PROGRESS')
    startOperationPolling({
      delays: delaysOf(1, 1, 1),
      request: requestNew,
      handle: handleNew,
      onTimeout: vi.fn(),
    })

    // A's late SUCCESS is neither handled nor followed by another A poll
    await oldOperation.respond('SUCCESS')
    await vi.advanceTimersByTimeAsync(10_000)
    expect(handleOld).not.toHaveBeenCalled()
    expect(oldOperation.request).toHaveBeenCalledTimes(1)
    expect(onTimeoutOld).not.toHaveBeenCalled()

    // B keeps polling on its own schedule
    expect(requestNew).toHaveBeenCalledTimes(3)
    expect(handleNew).toHaveBeenCalledTimes(3)
  })

  it('does not report errors of a request that failed after stop', async () => {
    let reject: (error: Error) => void = () => {}
    const request = vi.fn(() => new Promise<Status>((_, r) => (reject = r)))
    const onError = vi.fn()
    const polling = startOperationPolling({
      delays: delaysOf(1, 1),
      request,
      handle: isSettled,
      onError,
      onTimeout: vi.fn(),
    })

    await vi.advanceTimersByTimeAsync(1000)
    polling.stop()
    reject(new Error('aborted'))
    await vi.advanceTimersByTimeAsync(10_000)
    expect(onError).not.toHaveBeenCalled()
    expect(request).toHaveBeenCalledTimes(1)
  })
})
