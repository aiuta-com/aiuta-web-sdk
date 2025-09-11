import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, onboardingStepsSelector } from '@/store/slices/configSlice/selectors'
import { Section, Onboarding } from '@/components'
import { useAppInitialization, useHomeAnimation } from '@/hooks'
import styles from './Home.module.scss'

/**
 * Home - Landing page with onboarding flow
 *
 * Handles:
 * - App initialization
 * - First-time user onboarding
 * - Returning user navigation
 * - Mobile/desktop differences
 */
export default function Home() {
  const isMobile = useAppSelector(isMobileSelector)
  const onboardingSteps = useAppSelector(onboardingStepsSelector)

  const { initializeApp } = useAppInitialization()
  const { animationConfig } = useHomeAnimation()

  // Initialize app on mount
  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  // Determine section styling based on mobile state and onboarding step
  const sectionClassName = isMobile && onboardingSteps === 2 ? styles.sectionMobile : ''

  return (
    <motion.div key="home-page" {...animationConfig}>
      <Section className={sectionClassName}>
        <Onboarding />
      </Section>
    </motion.div>
  )
}
