import React from 'react'
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
