import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { FitSurvey, SizeRecommendation } from '@/utils/sizeFit/types'

/**
 * standalone — opened via the `aiuta.sizeFit` SDK call; closing hides the app.
 * results — opened from the try-on results screen; "Got it" returns there.
 */
export type SizeFitOrigin = 'standalone' | 'results'

export type SizeFitStep = 'main' | 'shapes' | 'bra'

export interface SizeFitState {
  productId: string | null
  /** Size-chart code the survey is submitted against */
  sizeChart: string | null
  origin: SizeFitOrigin
  step: SizeFitStep
  /** Survey draft; prefilled from the cached previous survey */
  survey: Partial<FitSurvey>
  isLoading: boolean
  recommendation: SizeRecommendation | null
  /** The expected "no size for this body type / gender" outcome */
  noResult: boolean
}

const initialState: SizeFitState = {
  productId: null,
  sizeChart: null,
  origin: 'standalone',
  step: 'main',
  survey: {},
  isLoading: false,
  recommendation: null,
  noResult: false,
}

export const sizeFitSlice = createSlice({
  name: 'sizeFit',
  initialState,
  reducers: {
    startSession: (
      state,
      action: PayloadAction<{ productId: string; sizeChart: string; origin: SizeFitOrigin }>,
    ) => {
      // Fresh flow for the product; the survey draft survives so a repeat
      // visitor only confirms their parameters
      state.productId = action.payload.productId
      state.sizeChart = action.payload.sizeChart
      state.origin = action.payload.origin
      state.step = 'main'
      state.isLoading = false
      state.recommendation = null
      state.noResult = false
    },

    setStep: (state, action: PayloadAction<SizeFitStep>) => {
      state.step = action.payload
    },

    updateSurvey: (state, action: PayloadAction<Partial<FitSurvey>>) => {
      state.survey = { ...state.survey, ...action.payload }
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setRecommendation: (state, action: PayloadAction<SizeRecommendation>) => {
      state.recommendation = action.payload
      state.noResult = false
      state.isLoading = false
    },

    setNoResult: (state) => {
      state.recommendation = null
      state.noResult = true
      state.isLoading = false
    },

    resetSizeFit: () => initialState,
  },
})
