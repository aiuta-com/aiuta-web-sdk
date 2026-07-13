import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  sizeFitSlice,
  sizeFitProductIdSelector,
  sizeFitSizeChartSelector,
  sizeFitStepSelector,
  sizeFitSurveySelector,
  sizeFitIsLoadingSelector,
} from '@/store/slices/sizeFitSlice'
import type { SizeFitStep } from '@/store/slices/sizeFitSlice'
import { useRpc } from '@/contexts'
import { Icon, PrimaryButton } from '@/components'
import { useSizeFitStrings, useSizeFitRecommendation, isSurveyComplete } from '@/hooks'
import { useFitSurveyData } from '@/hooks/data'
import { combineClassNames } from '@/utils'
import { StepMain } from './steps/StepMain'
import { StepShapes } from './steps/StepShapes'
import { StepBra } from './steps/StepBra'
import { icons } from './icons'
import styles from './SizeFit.module.scss'

/**
 * SizeFitSurveyPage - the body survey of the Size & Fit flow
 *
 * Steps: main (gender/age/height/weight) → shapes (belly/hips) → bra
 * (female only), then the recommendation request. Steps are internal state,
 * not routes — the progress bar and back arrow live inside the page.
 */
export default function SizeFitSurveyPage() {
  const rpc = useRpc()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const productId = useAppSelector(sizeFitProductIdSelector)
  const sizeChart = useAppSelector(sizeFitSizeChartSelector)
  const step = useAppSelector(sizeFitStepSelector)
  const survey = useAppSelector(sizeFitSurveySelector)
  const isLoading = useAppSelector(sizeFitIsLoadingSelector)
  const { data: cachedSurvey } = useFitSurveyData()
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
    if (!sizeChart) navigate('/', { replace: true })
  }, [sizeChart, navigate])

  // Prefill from the cached previous survey (or default to Female, as iOS
  // does); the visitor confirms or edits — no auto-skip to results
  useEffect(() => {
    if (survey.gender) return
    dispatch(sizeFitSlice.actions.updateSurvey(cachedSurvey ?? { gender: 'Female' }))
  }, [dispatch, survey.gender, cachedSurvey])

  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'sizeFitSurvey',
      productIds: productId ? [productId] : [],
    })
  }, [rpc, productId])

  // The bra step only exists for the female survey
  const steps = useMemo<SizeFitStep[]>(
    () => (survey.gender === 'Female' ? ['main', 'shapes', 'bra'] : ['main', 'shapes']),
    [survey.gender],
  )
  const stepIndex = Math.max(0, steps.indexOf(step))
  const isLastStep = stepIndex === steps.length - 1

  const canProceed = step === 'main' ? isSurveyComplete({ ...survey }) : true

  const handleNext = () => {
    if (isLastStep) {
      void submit()
    } else {
      dispatch(sizeFitSlice.actions.setStep(steps[stepIndex + 1]))
    }
  }

  const handleBack = () => {
    dispatch(sizeFitSlice.actions.setStep(steps[stepIndex - 1]))
  }

  if (!sizeChart) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {stepIndex > 0 && (
          <button className={styles.backButton} onClick={handleBack} aria-label="Back">
            <Icon icon={icons.back} size={24} viewBox="0 0 24 24" />
          </button>
        )}
        <div className={styles.progress}>
          <div
            className={styles.progressFill}
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

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
        <PrimaryButton onClick={handleNext} disabled={!canProceed || isLoading}>
          {isLastStep ? sizeFitButtonFindMySize : sizeFitButtonNext}
        </PrimaryButton>
      </div>
    </div>
  )
}
