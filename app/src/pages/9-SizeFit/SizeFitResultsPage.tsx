import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  sizeFitSlice,
  sizeFitProductIdSelector,
  sizeFitOriginSelector,
  sizeFitSurveySelector,
  sizeFitRecommendationSelector,
  sizeFitNoResultSelector,
} from '@/store/slices/sizeFitSlice'
import { useRpc } from '@/contexts'
import { Icon, PrimaryButton } from '@/components'
import { useAppVisibility, useSizeFitStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import { displaySizes, BEST_FIT } from '@/utils/sizeFit/fitLogic'
import type { DisplaySize } from '@/utils/sizeFit/fitLogic'
import { icons } from './icons'
import styles from './SizeFit.module.scss'

interface SizeBarProps {
  display: DisplaySize
  muted?: boolean
  bestFitLabel: string
}

// A size option: name, a confidence track with a pointer bubble ("59%"), and
// the fit summary line ("Slightly loose in chest")
const SizeBar = ({ display, muted, bestFitLabel }: SizeBarProps) => {
  const summary = display.summary === BEST_FIT ? bestFitLabel : display.summary

  return (
    <div className={combineClassNames(styles.sizeBar, muted && styles.sizeBar_muted)}>
      <div className={styles.sizeBarName}>{display.size.name}</div>
      <div className={styles.sizeBarTrack}>
        <div className={styles.sizeBarFill} style={{ width: `${display.percent}%` }} />
        <span
          className={combineClassNames('aiuta-label-subtle', styles.sizeBarBubble)}
          style={{ left: `${display.percent}%` }}
        >
          {display.percent}%
        </span>
        <span className={styles.sizeBarPointer} style={{ left: `${display.percent}%` }} />
      </div>
      {summary && (
        <div className={combineClassNames('aiuta-label-subtle', styles.sizeBarSummary)}>
          {summary}
        </div>
      )}
    </div>
  )
}

/**
 * SizeFitResultsPage - the size recommendation
 *
 * Shows the recommended size with its confidence bar, the best neighbor size
 * for comparison, and the survey parameters. "Change" returns to the survey,
 * "Got it" finishes the flow.
 */
export default function SizeFitResultsPage() {
  const rpc = useRpc()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { hideApp } = useAppVisibility()
  const productId = useAppSelector(sizeFitProductIdSelector)
  const origin = useAppSelector(sizeFitOriginSelector)
  const survey = useAppSelector(sizeFitSurveySelector)
  const recommendation = useAppSelector(sizeFitRecommendationSelector)
  const noResult = useAppSelector(sizeFitNoResultSelector)
  const {
    sizeFitResultsTitle,
    sizeFitBestFit,
    sizeFitParametersTitle,
    sizeFitButtonChange,
    sizeFitButtonGotIt,
    sizeFitNoResultTitle,
    sizeFitNoResultDescription,
  } = useSizeFitStrings()

  // Stale navigation without a result in state → back to the survey
  useEffect(() => {
    if (!recommendation && !noResult) navigate('/size-fit', { replace: true })
  }, [recommendation, noResult, navigate])

  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'sizeFitResults',
      productIds: productId ? [productId] : [],
    })
  }, [rpc, productId])

  const handleChange = () => {
    dispatch(sizeFitSlice.actions.setStep('main'))
    navigate('/size-fit')
  }

  const handleGotIt = () => {
    if (origin === 'results') {
      navigate('/results')
    } else {
      hideApp()
    }
  }

  if (!recommendation && !noResult) return null

  const display = recommendation ? displaySizes(recommendation) : null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleChange} aria-label="Back">
          <Icon icon={icons.back} size={24} viewBox="0 0 24 24" />
        </button>
        <h1 className={combineClassNames('aiuta-page-title', styles.resultsTitle)}>
          {sizeFitResultsTitle}
        </h1>
      </div>

      {display ? (
        <>
          <div className={styles.recommendedName}>{display.best.size.name}</div>
          <SizeBar display={display.best} bestFitLabel={sizeFitBestFit} />
          {display.next && <SizeBar display={display.next} muted bestFitLabel={sizeFitBestFit} />}
        </>
      ) : (
        <div className={styles.noResult}>
          <span className="aiuta-title-m">{sizeFitNoResultTitle}</span>
          <p className="aiuta-label-regular">{sizeFitNoResultDescription}</p>
        </div>
      )}

      <div className={styles.footer}>
        {display && (
          <div className={styles.parameters}>
            <span className="aiuta-page-title">{sizeFitParametersTitle}</span>
            <p className="aiuta-label-regular">
              {survey.gender} / {survey.age} years / {survey.height} cm / {survey.weight} kg
            </p>
          </div>
        )}
        <button
          className={combineClassNames('aiuta-page-title', styles.changeButton)}
          onClick={handleChange}
        >
          {sizeFitButtonChange}
        </button>
        <PrimaryButton onClick={handleGotIt}>{sizeFitButtonGotIt}</PrimaryButton>
      </div>
    </div>
  )
}
