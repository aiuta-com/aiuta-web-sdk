import React from 'react'
import { combineClassNames } from '@/utils'
import { OnboardingSlideProps } from './types'
import styles from './OnboardingSlide.module.scss'

export const OnboardingSlide = ({ state, children }: OnboardingSlideProps) => {
  const containerClasses = combineClassNames(
    styles.onboardingSlide,
    styles[`onboardingSlide_${state}`],
  )

  return <div className={containerClasses}>{children}</div>
}
