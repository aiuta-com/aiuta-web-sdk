/**
 * Fit summary & confidence math
 *
 * Faithful port of the iOS SDK logic (Core+Api+SizeFit.swift, SizeResultsVC).
 * All phrases are intentionally hardcoded English, matching iOS — only the
 * standalone "Best fit" label is substitutable at the UI layer.
 */

import type { ItemMeasurement, MeasurementType, SizeInfo, SizeRecommendation } from './types'

type FitDirection = 'tight' | 'loose'
type FitTone = 'slight' | 'mayFeel' | 'exact'

/** API convention: fitRatio > 0 => body smaller than garment => loose */
function fitDirection(fitRatio: number): FitDirection {
  return fitRatio > 0 ? 'loose' : 'tight'
}

function fitTone(absFitRatio: number): FitTone | null {
  if (absFitRatio < 0.2) return null
  if (absFitRatio < 0.45) return 'slight'
  if (absFitRatio < 1.0) return 'mayFeel'
  return 'exact'
}

const PLACES: Partial<Record<MeasurementType, string>> = {
  chest_c: 'chest',
  waist_c: 'waist',
  hip_c: 'hips',
  over_bust: 'bust',
}

export const BEST_FIT = 'Best fit'

/**
 * Human-readable fit description like "Slightly loose in chest" or
 * "May feel tight in chest and waist". Returns BEST_FIT when the recommended
 * size has no notable issues, null when a non-recommended one doesn't.
 */
export function fitSummary(measurements: ItemMeasurement[], isRecommended: boolean): string | null {
  const issues: Array<{ tone: FitTone; direction: FitDirection; place: string }> = []
  for (const m of measurements) {
    const tone = fitTone(Math.abs(m.fitRatio))
    const place = PLACES[m.type]
    if (!tone || !place) continue
    issues.push({ tone, direction: fitDirection(m.fitRatio), place })
  }

  if (!issues.length) return isRecommended ? BEST_FIT : null

  const grouped = new Map<string, typeof issues>()
  for (const issue of issues) {
    const key = `${issue.direction}|${issue.tone}`
    const group = grouped.get(key)
    if (group) group.push(issue)
    else grouped.set(key, [issue])
  }

  const phrases = [...grouped.values()].map((group) => {
    const { tone, direction } = group[0]
    const places = group
      .map((i) => i.place)
      .sort()
      .join(' and ')
    switch (tone) {
      case 'slight':
        return `slightly ${direction} in ${places}`
      case 'mayFeel':
        return `may feel ${direction} in ${places}`
      case 'exact':
        return `${direction} in ${places}`
    }
  })

  const body = phrases.sort().join(phrases.length === 2 ? ' and ' : ', ')
  return body.charAt(0).toUpperCase() + body.slice(1)
}

export interface ConfidenceConfig {
  /** Falloff stiffness (0.6...1.2 is usually fine) */
  k: number
  /** Penalize tight (fitRatio < 0) stronger than loose */
  tightPenaltyMultiplier: number
  /** Measurement weights (can be adjusted per code/category) */
  measurementWeights: Partial<Record<MeasurementType, number>>
  defaultWeight: number
}

export const defaultConfidenceConfig: ConfidenceConfig = {
  k: 0.8,
  tightPenaltyMultiplier: 1.6,
  measurementWeights: {
    waist_c: 2.0,
    hip_c: 1.2,
    chest_c: 2.0,
    over_bust: 1.0,
    under_bust: 1.5,
    bra_underbust: 1.5,
  },
  defaultWeight: 1.0,
}

/** Absolute confidence 0...1 — weighted geometric mean of per-measurement scores */
export function absoluteConfidence(
  size: SizeInfo,
  config: ConfidenceConfig = defaultConfidenceConfig,
): number {
  if (!size.measurements.length) return 0

  let sumWeights = 0
  let sumWeightedLog = 0

  for (const m of size.measurements) {
    const w = config.measurementWeights[m.type] ?? config.defaultWeight
    const dirMult = m.fitRatio < 0 ? config.tightPenaltyMultiplier : 1.0
    const score = Math.exp(-config.k * Math.abs(m.fitRatio) * dirMult)
    sumWeights += w
    sumWeightedLog += w * Math.log(Math.max(score, 1e-12))
  }

  if (sumWeights <= 0) return 0
  return Math.exp(sumWeightedLog / sumWeights)
}

export function absoluteConfidencePercent(
  size: SizeInfo,
  config: ConfidenceConfig = defaultConfidenceConfig,
): number {
  return Math.round(absoluteConfidence(size, config) * 100)
}

export function recommendedSize(rec: SizeRecommendation): SizeInfo | null {
  return rec.sizes.find((s) => s.name === rec.recommendedSizeName) ?? null
}

export function rankedByAbsoluteConfidence(
  rec: SizeRecommendation,
  config: ConfidenceConfig = defaultConfidenceConfig,
): Array<{ size: SizeInfo; confidence: number }> {
  return rec.sizes
    .map((size) => ({ size, confidence: absoluteConfidence(size, config) }))
    .sort((a, b) => b.confidence - a.confidence)
}

/**
 * The "next" option: best-ranked size other than the recommendation's rank
 * (iOS parity, including its ranked-index comparison).
 */
export function nextBestSize(
  rec: SizeRecommendation,
  config: ConfidenceConfig = defaultConfidenceConfig,
): SizeInfo | null {
  const ranked = rankedByAbsoluteConfidence(rec, config)
  const recIdx = ranked.findIndex((r) => r.size.name === rec.recommendedSizeName)
  if (recIdx === -1) return ranked[1]?.size ?? null
  return ranked.find((_, offset) => offset !== recIdx)?.size ?? null
}

/** The better-confidence neighbor of the recommended size in the size scale */
export function bestNeighborOfRecommended(
  rec: SizeRecommendation,
  config: ConfidenceConfig = defaultConfidenceConfig,
): SizeInfo | null {
  const idx = rec.sizes.findIndex((s) => s.name === rec.recommendedSizeName)
  if (idx === -1) return null

  const left = idx > 0 ? rec.sizes[idx - 1] : null
  const right = idx + 1 < rec.sizes.length ? rec.sizes[idx + 1] : null

  if (!left) return right
  if (!right) return left
  return absoluteConfidence(left, config) >= absoluteConfidence(right, config) ? left : right
}

export interface DisplaySize {
  size: SizeInfo
  /** Display-clamped confidence percent */
  percent: number
  summary: string | null
}

/**
 * Everything the results screen renders: the recommended size and its best
 * scale neighbor, with iOS display clamps (best >= 30; next in [20, best-10]).
 */
export function displaySizes(
  rec: SizeRecommendation,
  config: ConfidenceConfig = defaultConfidenceConfig,
): { best: DisplaySize; next: DisplaySize | null } | null {
  const best = recommendedSize(rec)
  if (!best) return null

  const bestPercent = Math.max(30, absoluteConfidencePercent(best, config))
  const result: { best: DisplaySize; next: DisplaySize | null } = {
    best: {
      size: best,
      percent: bestPercent,
      summary: fitSummary(best.measurements, true),
    },
    next: null,
  }

  const neighbor = bestNeighborOfRecommended(rec, config)
  if (neighbor) {
    const raw = absoluteConfidencePercent(neighbor, config)
    result.next = {
      size: neighbor,
      percent: Math.min(Math.max(raw, 20), bestPercent - 10),
      summary: fitSummary(neighbor.measurements, false),
    }
  }

  return result
}
