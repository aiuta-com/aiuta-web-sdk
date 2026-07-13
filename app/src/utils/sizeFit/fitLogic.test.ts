import { describe, expect, it } from 'vitest'
import {
  absoluteConfidence,
  absoluteConfidencePercent,
  bestNeighborOfRecommended,
  displaySizes,
  fitSummary,
  nextBestSize,
} from './fitLogic'
import type { ItemMeasurement, SizeInfo, SizeRecommendation } from './types'

const m = (type: ItemMeasurement['type'], fitRatio: number): ItemMeasurement => ({ type, fitRatio })

describe('fitSummary', () => {
  it('ignores ratios below 0.2', () => {
    expect(fitSummary([m('chest_c', 0.19), m('waist_c', -0.1)], false)).toBeNull()
  })

  it('returns "Best fit" for the recommended size without issues', () => {
    expect(fitSummary([m('chest_c', 0.1)], true)).toBe('Best fit')
    expect(fitSummary([], true)).toBe('Best fit')
  })

  it('maps tone buckets: slightly / may feel / exact', () => {
    expect(fitSummary([m('chest_c', 0.2)], false)).toBe('Slightly loose in chest')
    expect(fitSummary([m('chest_c', 0.45)], false)).toBe('May feel loose in chest')
    expect(fitSummary([m('chest_c', 1.0)], false)).toBe('Loose in chest')
  })

  it('maps direction from the fitRatio sign', () => {
    expect(fitSummary([m('chest_c', -0.3)], false)).toBe('Slightly tight in chest')
    expect(fitSummary([m('chest_c', 0.3)], false)).toBe('Slightly loose in chest')
  })

  it('skips measurement types without a place word', () => {
    expect(fitSummary([m('bmi', 2), m('inseam', -2), m('cup', 0.5)], false)).toBeNull()
  })

  it('joins same-group places alphabetically with "and"', () => {
    expect(fitSummary([m('waist_c', 0.3), m('chest_c', 0.25)], false)).toBe(
      'Slightly loose in chest and waist',
    )
  })

  it('joins exactly two phrases with "and", more with commas', () => {
    expect(fitSummary([m('chest_c', 0.3), m('hip_c', -0.5)], false)).toBe(
      'May feel tight in hips and slightly loose in chest',
    )
    expect(fitSummary([m('chest_c', 0.3), m('hip_c', -0.5), m('waist_c', 1.2)], false)).toBe(
      'Loose in waist, may feel tight in hips, slightly loose in chest',
    )
  })
})

describe('confidence', () => {
  it('is 1 for a perfect fit and decreases with |fitRatio|', () => {
    expect(absoluteConfidence({ name: 'M', measurements: [m('chest_c', 0)] })).toBe(1)
    const close = absoluteConfidence({ name: 'M', measurements: [m('chest_c', 0.2)] })
    const far = absoluteConfidence({ name: 'M', measurements: [m('chest_c', 0.8)] })
    expect(close).toBeGreaterThan(far)
  })

  it('penalizes tight more than loose', () => {
    const loose = absoluteConfidence({ name: 'M', measurements: [m('chest_c', 0.5)] })
    const tight = absoluteConfidence({ name: 'M', measurements: [m('chest_c', -0.5)] })
    expect(loose).toBeGreaterThan(tight)
  })

  it('returns 0 for empty measurements', () => {
    expect(absoluteConfidence({ name: 'M', measurements: [] })).toBe(0)
  })

  it('computes the documented percent: exp(-0.8 * 0.25) ≈ 82%', () => {
    expect(absoluteConfidencePercent({ name: 'M', measurements: [m('chest_c', 0.25)] })).toBe(82)
  })
})

const size = (name: string, fitRatio: number): SizeInfo => ({
  name,
  measurements: [m('chest_c', fitRatio)],
})

const rec = (recommendedSizeName: string, sizes: SizeInfo[]): SizeRecommendation => ({
  recommendedSizeName,
  sizes,
  bodyMeasurements: [],
})

describe('size ranking', () => {
  it('nextBestSize returns the runner-up when the recommendation ranks first', () => {
    const r = rec('36', [size('34', -0.6), size('36', 0.1), size('38', 0.9)])
    expect(nextBestSize(r)?.name).toBe('38')
  })

  it('nextBestSize returns the top-ranked size when the recommendation does not rank first (iOS parity quirk)', () => {
    const r = rec('34', [size('34', -0.6), size('36', 0.1)])
    expect(nextBestSize(r)?.name).toBe('36')
  })

  it('bestNeighborOfRecommended picks the more confident scale neighbor', () => {
    const r = rec('36', [size('34', -0.4), size('36', 0.1), size('38', 0.9)])
    expect(bestNeighborOfRecommended(r)?.name).toBe('34')
  })

  it('bestNeighborOfRecommended handles edge positions', () => {
    expect(bestNeighborOfRecommended(rec('34', [size('34', 0), size('36', 1)]))?.name).toBe('36')
    expect(bestNeighborOfRecommended(rec('34', [size('34', 0)]))).toBeNull()
  })
})

describe('displaySizes', () => {
  it('clamps best to >= 30 and next to [20, best - 10]', () => {
    // huge ratios → tiny raw confidences
    const r = rec('36', [size('34', -5), size('36', 4)])
    const d = displaySizes(r)!
    expect(d.best.percent).toBe(30)
    expect(d.next?.percent).toBe(20)
  })

  it('caps next at best - 10', () => {
    const r = rec('36', [size('34', -0.1), size('36', 0.1)])
    const d = displaySizes(r)!
    expect(d.next?.percent).toBe(d.best.percent - 10)
  })

  it('returns null when the recommended size is missing from the list', () => {
    expect(displaySizes(rec('40', [size('34', 0)]))).toBeNull()
  })

  it('renders summaries for both bars', () => {
    const r = rec('36', [size('34', -0.3), size('36', 0.1)])
    const d = displaySizes(r)!
    expect(d.best.summary).toBe('Best fit')
    expect(d.next?.summary).toBe('Slightly tight in chest')
  })
})
