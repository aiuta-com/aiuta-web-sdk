import React, { useEffect, useLayoutEffect, useRef } from 'react'
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
import { PrimaryButton, SecondaryButton } from '@/components'
import { useAppVisibility, useSizeFitStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import { displaySizes, BEST_FIT } from '@/utils/sizeFit/fitLogic'
import type { DisplaySize } from '@/utils/sizeFit/fitLogic'
import styles from './SizeFit.module.scss'

interface SizeBarProps {
  display: DisplaySize
  muted?: boolean
  bestFitLabel: string
}

// A size option (Figma 13677:956): the size name and the confidence badge on
// one line, a fully tinted track with a pointer dot at the confidence
// position, and the fit summary line ("Slightly loose in chest") below
const SizeBar = ({ display, muted, bestFitLabel }: SizeBarProps) => {
  const summary = display.summary === BEST_FIT ? bestFitLabel : display.summary
  // The badge is half its width wide (23px) — clamp it inside the track
  const badgeLeft = `clamp(23px, ${display.percent}%, calc(100% - 23px))`

  return (
    <div className={combineClassNames(styles.sizeBar, muted && styles.sizeBar_muted)}>
      <div className={styles.sizeBarHead}>
        <div className={combineClassNames('aiuta-title-m', styles.sizeBarName)}>
          {display.size.name}
        </div>
        <span
          className={combineClassNames('aiuta-button-s', styles.sizeBarBadge)}
          style={{ left: badgeLeft }}
        >
          {display.percent}%
        </span>
      </div>
      <div className={styles.sizeBarTrack}>
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

  // The huge size name never wraps (nowrap in the SCSS — "40/42" must not
  // split); a long one shrinks from the 132px base until the line fits.
  // Width-only guard: the font-size writes change the element's HEIGHT,
  // which would re-trigger the observer forever.
  const nameRef = useRef<HTMLDivElement>(null)
  const nameText = recommendation ? displaySizes(recommendation)?.best.size.name : undefined
  useLayoutEffect(() => {
    const el = nameRef.current
    if (!el) return
    let lastWidth = -1
    const fit = () => {
      if (el.clientWidth === lastWidth) return
      lastWidth = el.clientWidth
      el.style.fontSize = ''
      const base = parseFloat(getComputedStyle(el).fontSize)
      if (el.scrollWidth > el.clientWidth) {
        el.style.fontSize = `${Math.floor((base * el.clientWidth) / el.scrollWidth)}px`
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [nameText])

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
    // The "Recommended size" title and the back arrow live in the PageBar
    <div className={styles.page}>
      {display ? (
        <>
          <div ref={nameRef} className={styles.recommendedName}>
            {display.best.size.name}
          </div>
          <div className={styles.sizeBars}>
            <SizeBar display={display.best} bestFitLabel={sizeFitBestFit} />
            {display.next && <SizeBar display={display.next} muted bestFitLabel={sizeFitBestFit} />}
          </div>
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
        <SecondaryButton
          ghost
          maxWidth
          shape="M"
          classNames={styles.changeButton}
          onClick={handleChange}
        >
          {sizeFitButtonChange}
        </SecondaryButton>
        <PrimaryButton onClick={handleGotIt} className={styles.footerButton}>
          {sizeFitButtonGotIt}
        </PrimaryButton>
      </div>
    </div>
  )
}
