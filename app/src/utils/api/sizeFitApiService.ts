import type { SizeFitRequestOptions } from '@lib/rpc'
import type { FitSurvey, MeasurementType, SizeRecommendation } from '../sizeFit/types'

/**
 * Size recommendations come from the naiz.fit API directly (the Aiuta backend
 * used to proxy this verbatim): POST /recommendation with the tenant API key
 * and partition headers; the payload matches FitSurvey field-for-field
 * (camelCase per the naiz OpenAPI spec).
 */
const NAIZ_API_URL = 'https://api.naiz.fit'

export type SizeFitRecommendationResult =
  | { kind: 'recommendation'; recommendation: SizeRecommendation }
  /** The expected "wrong body type / gender / no chart" outcome, not a failure */
  | { kind: 'noResult' }

const KNOWN_MEASUREMENT_TYPES: MeasurementType[] = [
  'chest_c',
  'waist_c',
  'hip_c',
  'bmi',
  'inseam',
  'cup',
  'bra_underbust',
  'over_bust',
  'under_bust',
]

const measurementType = (raw: unknown): MeasurementType =>
  KNOWN_MEASUREMENT_TYPES.includes(raw as MeasurementType) ? (raw as MeasurementType) : 'unknown'

export class SizeFitApiService {
  static async getRecommendation(
    options: SizeFitRequestOptions,
    survey: FitSurvey,
  ): Promise<SizeFitRecommendationResult> {
    const response = await fetch(`${NAIZ_API_URL}/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': options.apiKey,
        'X-Partition': options.partition,
      },
      body: JSON.stringify({
        code: options.sizeChart,
        age: survey.age,
        height: survey.height,
        weight: survey.weight,
        gender: survey.gender,
        hipShape: survey.hipShape,
        bellyShape: survey.bellyShape,
        braSize: survey.braSize,
        braCup: survey.braCup,
      }),
    })

    // A 4xx is the expected "this chart doesn't cover that body" answer;
    // 5xx / network failures stay thrown errors for the caller's snackbar.
    if (!response.ok) {
      if (response.status >= 400 && response.status < 500) {
        return { kind: 'noResult' }
      }
      throw new Error(`Size & fit recommendation failed: ${response.status} ${response.statusText}`)
    }

    // naiz wraps every payload in a { data } envelope
    const payload = await response.json()
    const data = payload?.data ?? payload

    const recommendation: SizeRecommendation = {
      recommendedSizeName: data?.recommendedSizeName ?? '',
      sizes: (data?.sizes ?? []).map((size: any) => ({
        name: size?.name ?? '',
        measurements: (size?.measurements ?? []).map((m: any) => ({
          type: measurementType(m?.type),
          fitRatio: Number(m?.fitRatio ?? 0),
        })),
      })),
      bodyMeasurements: (data?.bodyMeasurements ?? []).map((m: any) => ({
        type: measurementType(m?.type),
        value: Number(m?.value ?? 0),
      })),
    }

    if (!recommendation.recommendedSizeName || !recommendation.sizes.length) {
      return { kind: 'noResult' }
    }

    return { kind: 'recommendation', recommendation }
  }
}
