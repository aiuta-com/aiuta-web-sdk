import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, easeInOut } from 'framer-motion'

// redux
import { useAppSelector, useAppDispatch } from '@lib/redux/store'

// actions
import { configSlice } from '@lib/redux/slices/configSlice'

// selectors
import { isMobileSelector, onboardingStepsSelector } from '@lib/redux/slices/configSlice/selectors'

// components
import { Section } from '@/components/feature/'
import { Onboarding } from '@/components/shared'

// styles
import styles from './index.module.scss'

const initiallAnimationConfig = {
  initial: {
    opacity: 1,
    scale: 1,
    x: '0vw',
  },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    scale: 0,
    x: '0vw',
  },
  transition: {
    duration: 0.3,
    ease: easeInOut,
  },
}

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isMobile = useAppSelector(isMobileSelector)
  const onboardingSteps = useAppSelector(onboardingStepsSelector)

  useEffect(() => {
    if (!globalThis) return
    dispatch(configSlice.actions.setIsShowSpinner(true))

    setTimeout(() => {
      const isOnboarding = localStorage.getItem('isOnboarding') || false
      const recentlyPhotosFromStorage = JSON.parse(
        localStorage.getItem('tryon-recent-photos') || '[]',
      )

      if (isOnboarding) {
        if (recentlyPhotosFromStorage.length > 0) {
          navigate('/view')
        } else {
          if (isMobile) {
            navigate('/view')
          } else {
            navigate('/qr')
          }
        }

        setTimeout(() => {
          dispatch(configSlice.actions.setIsInitialized(true))
          dispatch(configSlice.actions.setIsShowSpinner(false))
        }, 500)
      } else {
        dispatch(configSlice.actions.setIsInitialized(true))
        dispatch(configSlice.actions.setIsShowSpinner(false))

        if (isMobile) {
          dispatch(configSlice.actions.setIsShowFooter(false))
        }
      }
    }, 2000)
  }, [navigate, isMobile, dispatch])

  return (
    <>
      {/*
        React apps typically manage <head> via react-helmet or similar libraries.
        You should remove <head> here and add these meta tags in index.html or via react-helmet.
      */}
      <motion.div key="home-page" {...initiallAnimationConfig}>
        <Section className={`${isMobile && onboardingSteps === 2 ? styles.sectionMobile : ''}`}>
          <Onboarding />
        </Section>
      </motion.div>
    </>
  )
}
