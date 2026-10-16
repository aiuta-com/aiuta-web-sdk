export interface OperationPolling {
  /** Cancels the pending poll; a poll already in flight won't schedule the next one */
  stop: () => void
}

export interface OperationPollingOptions {
  /** Delays in seconds, each waited before the next poll (see operationDelays) */
  delays: Iterator<number>
  /** Requests the status once; resolves true when the operation is settled */
  poll: () => Promise<boolean>
  /** Called when the delays run out before the operation settled */
  onTimeout: () => void
}

/**
 * Polls an operation sequentially: wait → poll → response → next wait, so
 * polls never overlap. A rejected poll counts as not settled and is retried
 * with the next delay.
 */
export const startOperationPolling = ({
  delays,
  poll,
  onTimeout,
}: OperationPollingOptions): OperationPolling => {
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
      const isSettled = await poll().catch(() => false)
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
