import React from 'react'
import { useSizeFitStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import { BRA_BANDS, BRA_CUPS } from '@/utils/sizeFit/types'
import type { FitSurvey } from '@/utils/sizeFit/types'
import styles from '../SizeFit.module.scss'

interface StepBraProps {
  survey: Partial<FitSurvey>
  onChange: (patch: Partial<FitSurvey>) => void
}

export const StepBra = ({ survey, onChange }: StepBraProps) => {
  const { sizeFitBraBandTitle, sizeFitBraCupTitle } = useSizeFitStrings()

  return (
    <>
      <h2 className={combineClassNames('aiuta-page-title', styles.chipsTitle)}>
        {sizeFitBraBandTitle}
      </h2>
      <div className={styles.chips}>
        {BRA_BANDS.map((band) => (
          <button
            key={band}
            className={combineClassNames(
              'aiuta-label-regular',
              styles.chip,
              survey.braSize === band && styles.chip_selected,
            )}
            onClick={() => onChange({ braSize: band })}
          >
            {band}
          </button>
        ))}
      </div>

      <h2 className={combineClassNames('aiuta-page-title', styles.chipsTitle)}>
        {sizeFitBraCupTitle}
      </h2>
      <div className={styles.chips}>
        {BRA_CUPS.map((cup) => (
          <button
            key={cup}
            className={combineClassNames(
              'aiuta-label-regular',
              styles.chip,
              survey.braCup === cup && styles.chip_selected,
            )}
            onClick={() => onChange({ braCup: cup })}
          >
            {cup}
          </button>
        ))}
      </div>
    </>
  )
}
