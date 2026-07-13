import React from 'react'
import { useSizeFitStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import type { BellyShape, FitSurvey, HipShape } from '@/utils/sizeFit/types'
import styles from '../SizeFit.module.scss'

interface StepShapesProps {
  survey: Partial<FitSurvey>
  onChange: (patch: Partial<FitSurvey>) => void
}

export const StepShapes = ({ survey, onChange }: StepShapesProps) => {
  const {
    sizeFitBellyTitle,
    sizeFitBellyFlatter,
    sizeFitBellyAverage,
    sizeFitBellyFull,
    sizeFitHipsTitle,
    sizeFitHipsStraight,
    sizeFitHipsAverage,
    sizeFitHipsWide,
  } = useSizeFitStrings()

  // Display labels differ from the API enum values (Flatter → Flat etc.),
  // matching the iOS survey
  const bellyOptions: Array<{ value: BellyShape; label: string }> = [
    { value: 'Flat', label: sizeFitBellyFlatter },
    { value: 'Normal', label: sizeFitBellyAverage },
    { value: 'Curvy', label: sizeFitBellyFull },
  ]
  const hipOptions: Array<{ value: HipShape; label: string }> = [
    { value: 'Slim', label: sizeFitHipsStraight },
    { value: 'Normal', label: sizeFitHipsAverage },
    { value: 'Curvy', label: sizeFitHipsWide },
  ]

  return (
    <>
      <h2 className={combineClassNames('aiuta-page-title', styles.sectionTitle)}>
        {sizeFitBellyTitle}
      </h2>
      <div className={styles.optionRow}>
        {bellyOptions.map(({ value, label }) => (
          <button
            key={value}
            className={combineClassNames(
              'aiuta-label-regular',
              styles.optionCard,
              styles.optionCard_tall,
              survey.bellyShape === value && styles.optionCard_selected,
            )}
            onClick={() => onChange({ bellyShape: value })}
          >
            {label}
          </button>
        ))}
      </div>

      <h2 className={combineClassNames('aiuta-page-title', styles.sectionTitle)}>
        {sizeFitHipsTitle}
      </h2>
      <div className={styles.optionRow}>
        {hipOptions.map(({ value, label }) => (
          <button
            key={value}
            className={combineClassNames(
              'aiuta-label-regular',
              styles.optionCard,
              styles.optionCard_tall,
              survey.hipShape === value && styles.optionCard_selected,
            )}
            onClick={() => onChange({ hipShape: value })}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
