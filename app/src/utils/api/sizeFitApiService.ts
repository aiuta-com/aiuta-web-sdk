import type { ApiAuthParams } from './tryOnApiService'
import type {
  BellyShape,
  BraCup,
  FitGender,
  FitSurvey,
  HipShape,
  MeasurementType,
  SizeRecommendation,
} from '../sizeFit/types'

declare const __TRY_ON_API_URL__: string

/** Wire format of POST /size_and_fit/recommendation (same request as iOS) */
export interface SizeFitRecommendationRequest {
  /** Size-chart code of the product */
  code: string
  age: number
  height: number
  weight: number
  gender: FitGender
  hip_shape?: HipShape
  belly_shape?: BellyShape
  bra_size?: number
  bra_cup?: BraCup
}

export type SizeFitRecommendationResult =
  | { kind: 'recommendation'; recommendation: SizeRecommendation }
  /** The expected "wrong body type / gender" outcome, not a failure */
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

export function buildRecommendationRequest(
  code: string,
  survey: FitSurvey,
): SizeFitRecommendationRequest {
  return {
    code,
    age: survey.age,
    height: survey.height,
    weight: survey.weight,
    gender: survey.gender,
    hip_shape: survey.hipShape,
    belly_shape: survey.bellyShape,
    bra_size: survey.braSize,
    bra_cup: survey.braCup,
  }
}

export class SizeFitApiService {
  private static readonly BASE_URL = __TRY_ON_API_URL__

  private static addAuthHeaders(headers: Record<string, string>, auth: ApiAuthParams): void {
    if (auth.apiKey) {
      headers['x-api-key'] = auth.apiKey
    } else if (auth.subscriptionId) {
      headers['x-user-id'] = auth.subscriptionId
    }
  }

  static async getRecommendation(
    request: SizeFitRecommendationRequest,
    auth: ApiAuthParams,
  ): Promise<SizeFitRecommendationResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    this.addAuthHeaders(headers, auth)

    const response = await fetch(`${this.BASE_URL}/size_and_fit/recommendation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })

    // A 4xx is the expected "this chart doesn't cover that body" answer;
    // 5xx / network failures stay thrown errors for the caller's snackbar.
    if (!response.ok) {
      if (response.status >= 400 && response.status < 500) {
        return { kind: 'noResult' }
      }
      throw new Error(`Size & fit recommendation failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    const recommendation: SizeRecommendation = {
      recommendedSizeName: data?.recommended_size_name ?? '',
      sizes: (data?.sizes ?? []).map((size: any) => ({
        name: size?.name ?? '',
        measurements: (size?.measurements ?? []).map((m: any) => ({
          type: measurementType(m?.type),
          fitRatio: Number(m?.fit_ratio ?? 0),
        })),
      })),
      bodyMeasurements: (data?.body_measurements ?? []).map((m: any) => ({
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
