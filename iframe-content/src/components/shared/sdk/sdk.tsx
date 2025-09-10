import React from 'react'

// redux

// selectors

// components
import { Layout } from '@/components/feature'
import { Onboarding } from '@/components/shared'
import { Section } from '@/components/feature/section/section'

import styles from './sdk.module.scss'

export const Sdk = () => {
  return (
    <Layout>
      <Section className={`${styles.onboardingSection} `}>
        <Onboarding />
      </Section>
    </Layout>
  )
}
