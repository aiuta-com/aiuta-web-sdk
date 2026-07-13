import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  sizeFitSlice,
  sizeFitOptionsSelector,
  sizeFitSurveySelector,
} from '@/store/slices/sizeFitSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { useSaveFitSurvey } from '@/hooks/data'
import { SizeFitApiService } from '@/utils/api'
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
 * Submits the fit survey to naiz.fit with the session's size-chart code and
 * credentials, and routes to the results screen — both for a recommendation
 * and for the expected "no size for this body" outcome. Unexpected failures
 * show the error snackbar and stay on the survey.
 */
export const useSizeFitRecommendation = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const options = useAppSelector(sizeFitOptionsSelector)
  const survey = useAppSelector(sizeFitSurveySelector)
  const { mutate: saveFitSurvey } = useSaveFitSurvey()

  const submit = useCallback(async () => {
    if (!options || !isSurveyComplete(survey)) return

    dispatch(sizeFitSlice.actions.setIsLoading(true))

    // Remember the survey for the next visit regardless of the outcome
    saveFitSurvey(survey)

    try {
      const result = await SizeFitApiService.getRecommendation(options, survey)

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
  }, [dispatch, navigate, saveFitSurvey, options, survey])

  return { submit }
}
