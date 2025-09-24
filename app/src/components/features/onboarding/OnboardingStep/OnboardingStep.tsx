import React, { useMemo } from 'react'
import { OnboardingStepProps } from './types'
import styles from './OnboardingStep.module.scss'

export const OnboardingStep = ({ state, children }: OnboardingStepProps) => {
  const containerClasses = useMemo(
    () =>
      [
        styles.onboardingStep,
        state === 'pending' ? styles.onboardingStep_pending : '',
        state === 'active' ? styles.onboardingStep_active : '',
        state === 'completed' ? styles.onboardingStep_completed : '',
      ]
        .filter(Boolean)
        .join(' '),
    [state],
  )

  return <div className={containerClasses}>{children}</div>
}
