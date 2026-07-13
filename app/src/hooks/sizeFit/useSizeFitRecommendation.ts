import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  sizeFitSlice,
  sizeFitSizeChartSelector,
  sizeFitSurveySelector,
} from '@/store/slices/sizeFitSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { useRpc } from '@/contexts'
import { useSaveFitSurvey } from '@/hooks/data'
import { SizeFitApiService, buildRecommendationRequest } from '@/utils/api'
import { getAuthParams } from '@/utils/api/authParams'
import type { FitSurvey } from '@/utils/sizeFit/types'

/** A survey draft is submittable once the required numbers are in */
export function isSurveyComplete(survey: Partial<FitSurvey>): survey is FitSurvey {
  return (
    !!survey.gender &&
    !!survey.age &&
    survey.age > 0 &&
    !!survey.height &&
    survey.height > 0 &&
    !!survey.weight &&
    survey.weight > 0
  )
}

/**
 * Submits the fit survey against the session's size-chart code and routes to
 * the results screen — both for a recommendation and for the expected
 * "no size for this body" outcome. Unexpected failures show the error
 * snackbar and stay on the survey.
 */
export const useSizeFitRecommendation = () => {
  const rpc = useRpc()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const sizeChart = useAppSelector(sizeFitSizeChartSelector)
  const survey = useAppSelector(sizeFitSurveySelector)
  const { mutate: saveFitSurvey } = useSaveFitSurvey()

  const submit = useCallback(async () => {
    if (!sizeChart || !isSurveyComplete(survey)) return

    dispatch(sizeFitSlice.actions.setIsLoading(true))

    // Remember the survey for the next visit regardless of the outcome
    saveFitSurvey(survey)

    try {
      const result = await SizeFitApiService.getRecommendation(
        buildRecommendationRequest(sizeChart, survey),
        getAuthParams(rpc.config.auth),
      )

      if (result.kind === 'recommendation') {
        dispatch(sizeFitSlice.actions.setRecommendation(result.recommendation))
      } else {
        dispatch(sizeFitSlice.actions.setNoResult())
      }
      navigate('/size-fit/results')
    } catch {
      dispatch(sizeFitSlice.actions.setIsLoading(false))
      dispatch(errorSnackbarSlice.actions.showErrorSnackbar())
    }
  }, [dispatch, navigate, rpc, saveFitSurvey, sizeChart, survey])

  return { submit }
}
