import React from 'react'
import { Onboarding } from '@/components'
import { Section } from '@/components'
import styles from './sdk.module.scss'

export const Sdk = () => {
  return (
    <div className={styles.container}>
      <Section className={`${styles.onboardingSection} `}>
        <Onboarding />
      </Section>
    </div>
  )
}
