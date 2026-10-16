import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startOperationPolling } from './operationPolling'

// Resolves once the poll is called, so a test can control when it settles
const deferredPoll = () => {
  const resolvers: Array<(isSettled: boolean) => void> = []
  const poll = vi.fn(() => new Promise<boolean>((resolve) => resolvers.push(resolve)))
  const respond = async (isSettled: boolean) => {
    resolvers.shift()?.(isSettled)
    await vi.advanceTimersByTimeAsync(0)
  }
  return { poll, respond }
}

describe('startOperationPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits each delay before polling', async () => {
    const poll = vi.fn().mockResolvedValue(false)
    startOperationPolling({ delays: [1, 0.5][Symbol.iterator](), poll, onTimeout: vi.fn() })

    await vi.advanceTimersByTimeAsync(999)
    expect(poll).toHaveBeenCalledTimes(0)
    await vi.advanceTimersByTimeAsync(1)
    expect(poll).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(499)
    expect(poll).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(poll).toHaveBeenCalledTimes(2)
  })

  it('starts the next delay only after the response, so polls never overlap', async () => {
    const { poll, respond } = deferredPoll()
    startOperationPolling({ delays: [1, 1, 1][Symbol.iterator](), poll, onTimeout: vi.fn() })

    await vi.advanceTimersByTimeAsync(1000)
    expect(poll).toHaveBeenCalledTimes(1)

    // The response takes 5s: no other poll meanwhile
    await vi.advanceTimersByTimeAsync(5000)
    expect(poll).toHaveBeenCalledTimes(1)

    await respond(false)
    await vi.advanceTimersByTimeAsync(999)
    expect(poll).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(poll).toHaveBeenCalledTimes(2)
  })

  it('stops once the operation is settled', async () => {
    const poll = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    const onTimeout = vi.fn()
    startOperationPolling({ delays: [1, 1, 1, 1][Symbol.iterator](), poll, onTimeout })

    await vi.advanceTimersByTimeAsync(10_000)
    expect(poll).toHaveBeenCalledTimes(2)
    expect(onTimeout).not.toHaveBeenCalled()
  })

  it('times out when the delays run out before the operation settled', async () => {
    const poll = vi.fn().mockResolvedValue(false)
    const onTimeout = vi.fn()
    startOperationPolling({ delays: [1, 1][Symbol.iterator](), poll, onTimeout })

    await vi.advanceTimersByTimeAsync(1000)
    expect(onTimeout).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(poll).toHaveBeenCalledTimes(2)
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('retries a failed poll with the next delay', async () => {
    const poll = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(true)
    startOperationPolling({ delays: [1, 1, 1][Symbol.iterator](), poll, onTimeout: vi.fn() })

    await vi.advanceTimersByTimeAsync(10_000)
    expect(poll).toHaveBeenCalledTimes(2)
  })

  it('does not poll after being stopped during a delay', async () => {
    const poll = vi.fn().mockResolvedValue(false)
    const polling = startOperationPolling({
      delays: [1, 1][Symbol.iterator](),
      poll,
      onTimeout: vi.fn(),
    })

    await vi.advanceTimersByTimeAsync(500)
    polling.stop()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(poll).not.toHaveBeenCalled()
  })

  it('does not schedule the next poll when stopped while a poll is in flight', async () => {
    const { poll, respond } = deferredPoll()
    const onTimeout = vi.fn()
    const polling = startOperationPolling({ delays: [1, 1][Symbol.iterator](), poll, onTimeout })

    await vi.advanceTimersByTimeAsync(1000)
    polling.stop()
    await respond(false)
    await vi.advanceTimersByTimeAsync(10_000)
    expect(poll).toHaveBeenCalledTimes(1)
    expect(onTimeout).not.toHaveBeenCalled()
  })
})
