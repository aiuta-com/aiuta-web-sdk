export interface OperationPolling {
  /**
   * Cancels the pending poll. A response already in flight is dropped
   * without being handled, so it can't affect a newer operation.
   */
  stop: () => void
}

export interface OperationPollingOptions<T> {
  /** Delays in seconds, each waited before the next poll (see operationDelays) */
  delays: Iterator<number>
  /** Requests the operation status once */
  request: () => Promise<T>
  /** Handles a response; returns true when the operation is settled */
  handle: (response: T) => boolean
  /** Called when a request fails; it is retried with the next delay */
  onError?: (error: unknown) => void
  /** Called when the delays run out before the operation settled */
  onTimeout: () => void
}

/**
 * Polls an operation sequentially: wait → request → response → next wait, so
 * polls never overlap. Responses arriving after stop() are never handled.
 */
export const startOperationPolling = <T>({
  delays,
  request,
  handle,
  onError,
  onTimeout,
}: OperationPollingOptions<T>): OperationPolling => {
  let isStopped = false
  let timer: ReturnType<typeof setTimeout> | null = null

  const scheduleNextPoll = () => {
    const delay = delays.next()
    if (delay.done) {
      isStopped = true
      onTimeout()
      return
    }

    timer = setTimeout(async () => {
      timer = null
      let isSettled = false
      try {
        const response = await request()
        if (isStopped) return
        isSettled = handle(response)
      } catch (error) {
        if (isStopped) return
        onError?.(error)
      }
      if (!isSettled && !isStopped) scheduleNextPoll()
    }, delay.value * 1000)
  }

  scheduleNextPoll()

  return {
    stop: () => {
      isStopped = true
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
  }
}
