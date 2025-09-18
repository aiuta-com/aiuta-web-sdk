import React, { useMemo } from 'react'
import { OnboardingStepProps } from './types'
import styles from './OnboardingStep.module.scss'

export const OnboardingStep = ({
  state,
  title,
  description,
  imageUrl,
  children,
  isFirst = false,
  className,
}: OnboardingStepProps) => {
  const containerClasses = useMemo(
    () =>
      [
        styles.onboardingStep,
        isFirst ? styles.onboardingStep_first : styles.onboardingStep_positioned,
        state === 'inactive' ? styles.onboardingStep_inactive : '',
        state === 'active' ? styles.onboardingStep_active : '',
        state === 'completed' ? styles.onboardingStep_completed : '',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [state, isFirst, className],
  )

  // Render custom content if children provided (e.g., Consent step)
  if (children) {
    return <div className={containerClasses}>{children}</div>
  }

  // Render standard step with image and text
  return (
    <div className={containerClasses}>
      {imageUrl && (
        <img loading="lazy" alt="Onboarding step" src={imageUrl} className={styles.stepImage} />
      )}
      {(title || description) && (
        <div className={styles.titlesBox}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <h3 className={styles.description}>{description}</h3>}
        </div>
      )}
    </div>
  )
}
