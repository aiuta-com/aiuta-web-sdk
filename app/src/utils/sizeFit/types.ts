/**
 * Size & Fit domain types
 *
 * Mirrors the iOS SDK models (Core+Api+SizeFit.swift) and the wire format of
 * POST /size_and_fit/recommendation. Enum string values are the exact API
 * values — the UI shows different labels (e.g. 'Flat' is labeled "Flatter").
 */

export type MeasurementType =
  | 'chest_c'
  | 'waist_c'
  | 'hip_c'
  | 'bmi'
  | 'inseam'
  | 'cup'
  | 'bra_underbust'
  | 'over_bust'
  | 'under_bust'
  | 'unknown'

export interface ItemMeasurement {
  type: MeasurementType
  /** Positive = body smaller than garment (loose), negative = tight */
  fitRatio: number
}

export interface SizeInfo {
  name: string
  measurements: ItemMeasurement[]
}

export interface BodyMeasurement {
  type: MeasurementType
  value: number
}

export interface SizeRecommendation {
  recommendedSizeName: string
  sizes: SizeInfo[]
  bodyMeasurements: BodyMeasurement[]
}

export type FitGender = 'Male' | 'Female'
/** UI labels: Straight / Average / Wide */
export type HipShape = 'Slim' | 'Normal' | 'Curvy'
/** UI labels: Flatter / Average / Full */
export type BellyShape = 'Flat' | 'Normal' | 'Curvy'
export type BraCup = 'AA' | 'A' | 'B' | 'C' | 'D' | 'DD' | 'E' | 'F' | 'G'

export const BRA_CUPS: BraCup[] = ['AA', 'A', 'B', 'C', 'D', 'DD', 'E', 'F', 'G']
/** Chest circumference options for the bra step */
export const BRA_BANDS = [60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125]

export interface FitSurvey {
  gender: FitGender
  age: number
  height: number
  weight: number
  hipShape?: HipShape
  bellyShape?: BellyShape
  braSize?: number
  braCup?: BraCup
}
