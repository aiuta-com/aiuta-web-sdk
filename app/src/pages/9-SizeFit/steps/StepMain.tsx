import React from 'react'
import { Icon } from '@/components'
import { useSizeFitStrings } from '@/hooks'
import { combineClassNames } from '@/utils'
import type { FitGender, FitSurvey } from '@/utils/sizeFit/types'
import { icons } from '../icons'
import styles from '../SizeFit.module.scss'

interface StepMainProps {
  survey: Partial<FitSurvey>
  onChange: (patch: Partial<FitSurvey>) => void
}

interface NumericFieldProps {
  label: string
  unit?: string
  value: number | undefined
  onChange: (value: number | undefined) => void
}

// Bordered 68px cell with a floating label (placeholder-sized when empty,
// small above the value when filled — Figma) and an optional CM/KG unit tag
const NumericField = ({ label, unit, value, onChange }: NumericFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
    onChange(digits ? Number(digits) : undefined)
  }

  return (
    <label className={combineClassNames(styles.field, value !== undefined && styles.field_filled)}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        className={combineClassNames('aiuta-page-title', styles.fieldInput)}
        type="text"
        inputMode="numeric"
        value={value ?? ''}
        onChange={handleChange}
        aria-label={label}
      />
      {unit && (
        <span className={combineClassNames('aiuta-button-s', styles.fieldUnit)}>{unit}</span>
      )}
    </label>
  )
}

export const StepMain = ({ survey, onChange }: StepMainProps) => {
  const {
    sizeFitGenderMale,
    sizeFitGenderFemale,
    sizeFitAgeLabel,
    sizeFitHeightLabel,
    sizeFitWeightLabel,
  } = useSizeFitStrings()

  const genders: Array<{ gender: FitGender; label: string; icon: string }> = [
    { gender: 'Male', label: sizeFitGenderMale, icon: icons.male },
    { gender: 'Female', label: sizeFitGenderFemale, icon: icons.female },
  ]

  return (
    <>
      <div className={styles.optionRow}>
        {genders.map(({ gender, label, icon }) => (
          <button
            key={gender}
            className={combineClassNames(
              'aiuta-page-title',
              styles.optionCard,
              survey.gender === gender && styles.optionCard_selected,
            )}
            onClick={() => onChange({ gender })}
          >
            <Icon icon={icon} size={20} viewBox="0 0 24 24" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.fields}>
        <NumericField
          label={sizeFitAgeLabel}
          value={survey.age}
          onChange={(age) => onChange({ age })}
        />
        <NumericField
          label={sizeFitHeightLabel}
          unit="CM"
          value={survey.height}
          onChange={(height) => onChange({ height })}
        />
        <NumericField
          label={sizeFitWeightLabel}
          unit="KG"
          value={survey.weight}
          onChange={(weight) => onChange({ weight })}
        />
      </div>
    </>
  )
}
