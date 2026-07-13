import { RootState } from '@/store/store'

export const sizeFitProductIdSelector = (state: RootState) => state.sizeFit.productId
export const sizeFitSizeChartSelector = (state: RootState) => state.sizeFit.sizeChart
export const sizeFitOriginSelector = (state: RootState) => state.sizeFit.origin
export const sizeFitStepSelector = (state: RootState) => state.sizeFit.step
export const sizeFitSurveySelector = (state: RootState) => state.sizeFit.survey
export const sizeFitIsLoadingSelector = (state: RootState) => state.sizeFit.isLoading
export const sizeFitRecommendationSelector = (state: RootState) => state.sizeFit.recommendation
export const sizeFitNoResultSelector = (state: RootState) => state.sizeFit.noResult
