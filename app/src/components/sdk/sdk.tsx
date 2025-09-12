import React from 'react'

// redux

// selectors

// components
import { Layout } from '@/components'
import { Onboarding } from '@/components'
import { Section } from '@/components'

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
