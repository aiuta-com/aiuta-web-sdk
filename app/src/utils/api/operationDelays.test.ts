import { describe, expect, it } from 'vitest'
import { DEFAULT_OPERATION_DELAYS, operationDelays, parseOperationDelays } from './operationDelays'

const take = (iterator: Iterator<number>, count: number) => {
  const values: number[] = []
  for (let i = 0; i < count; i++) {
    const next = iterator.next()
    if (next.done) break
    values.push(next.value)
  }
  return values
}

describe('operationDelays', () => {
  it('uses the default sequence when none is given', () => {
    const delays = take(operationDelays(null), 26)
    expect(delays.slice(0, 4)).toEqual([1, 1, 1, 1])
    expect(delays.slice(4, 24)).toEqual(Array(20).fill(0.5))
    expect(delays.slice(24)).toEqual([3, 3])
  })

  it('uses the default sequence for an empty one', () => {
    expect(take(operationDelays([]), 5)).toEqual(take(operationDelays(DEFAULT_OPERATION_DELAYS), 5))
  })

  it('follows a backend sequence', () => {
    const delays = operationDelays([
      { mode: 'recurring', delay: 1, repeat: 1 },
      { mode: 'recurring', delay: 0.3, repeat: 2 },
      { mode: 'infinite', delay: 2 },
    ])
    expect(take(delays, 6)).toEqual([1, 0.3, 0.3, 2, 2, 2])
  })

  it('ends a sequence without an infinite step, which means a timeout', () => {
    const delays = operationDelays([{ mode: 'recurring', delay: 1, repeat: 2 }])
    expect(take(delays, 5)).toEqual([1, 1])
  })

  it('skips unknown modes and non-positive repeat counts', () => {
    const delays = operationDelays([
      { mode: 'exponential', delay: 5 },
      { mode: 'recurring', delay: 5, repeat: 0 },
      { mode: 'recurring', delay: 1, repeat: 1 },
    ])
    expect(take(delays, 5)).toEqual([1])
  })

  it('never polls faster than every 0.1s', () => {
    const delays = operationDelays([{ mode: 'infinite', delay: 0 }])
    expect(take(delays, 2)).toEqual([0.1, 0.1])
  })
})

describe('parseOperationDelays', () => {
  it('keeps a valid sequence', () => {
    const sequence = [{ mode: 'infinite', delay: 3 }]
    expect(parseOperationDelays(sequence)).toEqual(sequence)
  })

  it('rejects missing or malformed values', () => {
    expect(parseOperationDelays(undefined)).toBeNull()
    expect(parseOperationDelays({ mode: 'infinite' })).toBeNull()
    expect(parseOperationDelays([])).toBeNull()
    expect(parseOperationDelays([1, 'x', null])).toBeNull()
  })
})
