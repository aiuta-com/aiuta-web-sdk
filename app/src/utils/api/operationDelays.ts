/**
 * Delays between try-on operation status polls.
 *
 * The backend configures them per subscription in GET /subscription_details
 * as `operation_delays_sequence` — the same contract the iOS and Android SDKs
 * use. Delays are in seconds, each one is waited before the next status poll:
 *
 *   [
 *     { "mode": "recurring", "delay": 1.0, "repeat": 4 },
 *     { "mode": "recurring", "delay": 0.5, "repeat": 20 },
 *     { "mode": "infinite", "delay": 3.0 }
 *   ]
 *
 * When the sequence runs out (no `infinite` step) the operation times out.
 */
export interface OperationDelay {
  mode?: string
  delay?: number
  repeat?: number
}

export type OperationDelaysSequence = OperationDelay[]

export const DEFAULT_OPERATION_DELAYS: OperationDelaysSequence = [
  { mode: 'recurring', delay: 1, repeat: 4 },
  { mode: 'recurring', delay: 0.5, repeat: 20 },
  { mode: 'infinite', delay: 3 },
]

// Guards the backend against a misconfigured zero/negative delay turning the
// polling into a busy loop
const MIN_DELAY_SECONDS = 0.1

/**
 * Validates a raw `operation_delays_sequence` from the backend. Returns null
 * when it is missing or malformed, so the caller falls back to the default.
 */
export const parseOperationDelays = (raw: unknown): OperationDelaysSequence | null => {
  if (!Array.isArray(raw)) return null

  const steps = raw.filter(
    (step): step is OperationDelay => typeof step === 'object' && step !== null,
  )
  return steps.length > 0 ? steps : null
}

/**
 * Iterates the delays (in seconds) of a sequence. An empty or missing sequence
 * means the default one; steps with an unknown mode or a non-positive repeat
 * count are skipped.
 */
export function* operationDelays(sequence?: OperationDelaysSequence | null): Generator<number> {
  const steps = sequence && sequence.length > 0 ? sequence : DEFAULT_OPERATION_DELAYS

  for (const step of steps) {
    const delay = Math.max(
      typeof step.delay === 'number' && Number.isFinite(step.delay) ? step.delay : 0,
      MIN_DELAY_SECONDS,
    )

    if (step.mode === 'recurring') {
      const count = typeof step.repeat === 'number' ? Math.floor(step.repeat) : 0
      for (let i = 0; i < count; i++) yield delay
    } else if (step.mode === 'infinite') {
      while (true) yield delay
    }
  }
}
