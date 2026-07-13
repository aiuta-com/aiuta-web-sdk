import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  sizeFitSlice,
  sizeFitProductIdSelector,
  sizeFitOptionsSelector,
  sizeFitSurveySelector,
  sizeFitIsLoadingSelector,
} from '@/store/slices/sizeFitSlice'
import { useRpc } from '@/contexts'
import { PrimaryButton } from '@/components'
import {
  useSizeFitStrings,
  useSizeFitRecommendation,
  useSizeFitSteps,
  isSurveyComplete,
} from '@/hooks'
import { useFitSurveyData } from '@/hooks/data'
import { combineClassNames } from '@/utils'
import { StepMain } from './steps/StepMain'
import { StepShapes } from './steps/StepShapes'
import { StepBra } from './steps/StepBra'
import styles from './SizeFit.module.scss'

/**
 * SizeFitSurveyPage - the body survey of the Size & Fit flow
 *
 * Steps: main (gender/age/height/weight) → shapes (belly/hips) → bra
 * (female only), then the recommendation request. Steps are internal state,
 * not routes — the PageBar shows the step progress and drives the back
 * navigation (see usePageBarNavigation).
 */
export default function SizeFitSurveyPage() {
  const rpc = useRpc()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const productId = useAppSelector(sizeFitProductIdSelector)
  const options = useAppSelector(sizeFitOptionsSelector)
  const survey = useAppSelector(sizeFitSurveySelector)
  const isLoading = useAppSelector(sizeFitIsLoadingSelector)
  const { data: cachedSurvey, isFetched: isCacheFetched } = useFitSurveyData()
  const { steps, step, stepIndex, isLastStep } = useSizeFitSteps()
  const { submit } = useSizeFitRecommendation()
  const {
    sizeFitSurveyTitle,
    sizeFitPrivacyDisclaimerHtml,
    sizeFitButtonNext,
    sizeFitButtonFindMySize,
  } = useSizeFitStrings()

  // Direct navigation without a session (e.g. stale history) — nothing to
  // survey against, fall back to the regular entry
  useEffect(() => {
    if (!options) navigate('/', { replace: true })
  }, [options, navigate])

  // Prefill from the cached previous survey once, before anything was typed.
  // The session's product gender (set by startSession) wins over the cached
  // one; without either, default to Female as iOS does.
  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !isCacheFetched || survey.age !== undefined) return
    prefilled.current = true
    dispatch(
      sizeFitSlice.actions.updateSurvey({
        gender: 'Female',
        ...(cachedSurvey ?? {}),
        ...(survey.gender ? { gender: survey.gender } : {}),
      }),
    )
  }, [dispatch, isCacheFetched, cachedSurvey, survey.age, survey.gender])

  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'sizeFitSurvey',
      productIds: productId ? [productId] : [],
    })
  }, [rpc, productId])

  const canProceed = step === 'main' ? isSurveyComplete({ ...survey }) : true

  const handleNext = () => {
    if (isLastStep) {
      void submit()
    } else {
      dispatch(sizeFitSlice.actions.setStep(steps[stepIndex + 1]))
    }
  }

  if (!options) return null

  return (
    <div className={styles.page}>
      {step === 'main' && (
        <h1 className={combineClassNames('aiuta-page-title', styles.title)}>
          {sizeFitSurveyTitle}
        </h1>
      )}

      {step === 'main' && (
        <StepMain
          survey={survey}
          onChange={(patch) => dispatch(sizeFitSlice.actions.updateSurvey(patch))}
        />
      )}
      {step === 'shapes' && (
        <StepShapes
          survey={survey}
          onChange={(patch) => dispatch(sizeFitSlice.actions.updateSurvey(patch))}
        />
      )}
      {step === 'bra' && (
        <StepBra
          survey={survey}
          onChange={(patch) => dispatch(sizeFitSlice.actions.updateSurvey(patch))}
        />
      )}

      <div className={styles.footer}>
        {step === 'main' && (
          <span
            className={combineClassNames('aiuta-label-footnote', styles.disclaimer)}
            dangerouslySetInnerHTML={{ __html: sizeFitPrivacyDisclaimerHtml }}
          />
        )}
        <PrimaryButton
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          className={styles.footerButton}
        >
          {isLastStep ? sizeFitButtonFindMySize : sizeFitButtonNext}
        </PrimaryButton>
      </div>
    </div>
  )
}
