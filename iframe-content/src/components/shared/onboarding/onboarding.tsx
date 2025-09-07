import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// redux
import { useAppSelector, useAppDispatch } from '@lib/redux/store'

// actions
import { configSlice } from '@lib/redux/slices/configSlice'

// selectors
import {
  isMobileSelector,
  isInitializedSelector,
  isShowSpinnerSelector,
  onboardingStepsSelector,
  aiutaEndpointDataSelector,
} from '@lib/redux/slices/configSlice/selectors'

// components
import { OnboardingMobile } from './onboardingMobile'
import { Consent } from './components/consent/consent'
import { TitleDescription, TryOnButton } from '@/components/feature'

// types
import { AnalyticEventsEnum } from '@/types'

// styles
import styles from './onboarding.module.scss'

export const Onboarding = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [isChecked, setIsChecked] = useState(false)

  const isMobile = useAppSelector(isMobileSelector)
  const isShowSpinner = useAppSelector(isShowSpinnerSelector)
  const isInitialized = useAppSelector(isInitializedSelector)
  const onboardingSteps = useAppSelector(onboardingStepsSelector)
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector)

  const onboardingAnalytic = () => {
    const analytic = {
      data: {
        type: 'onboarding',
        pageId: 'consent',
        event: 'consentsGiven',
        productIds: [aiutaEndpointData.skuId],
      },
    }

    window.parent.postMessage({ action: AnalyticEventsEnum.onboarding, analytic }, '*')
  }

  const handleOnboardAnalyticFinish = () => {
    const analytic = {
      data: {
        type: 'onboarding',
        pageId: 'consent',
        event: 'onboardingFinished',
        productIds: [aiutaEndpointData.skuId],
      },
    }

    window.parent.postMessage({ action: AnalyticEventsEnum.onboarding, analytic }, '*')
  }

  const handleClickOnboardingButton = () => {
    if (onboardingSteps !== 2) {
      dispatch(configSlice.actions.setOnboardingSteps(null))
    } else {
      navigate('/qr')
      onboardingAnalytic()
      handleOnboardAnalyticFinish()
      localStorage.setItem('isOnboarding', JSON.stringify(true))
    }
  }

  const initPageAnalytic = (analytic: any) => {
    if (aiutaEndpointData.skuId && aiutaEndpointData.skuId.length > 0) {
      window.parent.postMessage({ action: AnalyticEventsEnum.onboarding, analytic }, '*')
    }
  }

  useEffect(() => {
    const isOnboarding = JSON.parse(localStorage.getItem('isOnboarding') || 'false')

    if (!isOnboarding) {
      if (onboardingSteps === 0) {
        const analytic = {
          data: {
            type: 'page',
            pageId: 'howItWorks',
            productIds: [aiutaEndpointData.skuId],
          },
        }

        initPageAnalytic(analytic)
      } else if (onboardingSteps === 1) {
        const analytic = {
          data: {
            type: 'page',
            pageId: 'bestResults',
            productIds: [aiutaEndpointData.skuId],
          },
        }

        initPageAnalytic(analytic)
      } else if (onboardingSteps === 2) {
        const analytic = {
          data: {
            type: 'page',
            pageId: 'consent',
            productIds: [aiutaEndpointData.skuId],
          },
        }

        initPageAnalytic(analytic)
      }
    }
  }, [aiutaEndpointData, onboardingSteps])

  return !isShowSpinner && isInitialized ? (
    <div className={styles.onboarding}>
      {isMobile ? (
        <OnboardingMobile />
      ) : (
        <div className={styles.obboardingStepBox}>
          <div
            className={`${styles.step} ${styles.firstStep} ${
              onboardingSteps > 0 ? styles.unactiveActiveStep : ''
            }`}
          >
            <>
              <img
                loading="lazy"
                alt="Onboarding image"
                src="./images/firstOnboarding.png"
                className={styles.firstImg}
              />
              <div className={styles.titlesBox}>
                <TitleDescription
                  title="Try on before buying"
                  description="Just upload your photo and see how it looks"
                />
              </div>
            </>
          </div>
          <div
            className={`${styles.step} ${styles.unactiveStep} ${
              onboardingSteps === 1
                ? styles.activeStep
                : onboardingSteps > 1
                  ? styles.unactiveActiveStep
                  : ''
            }`}
          >
            <img
              loading="lazy"
              alt="Onboarding image"
              src="./images/lastOnboarding.png"
              className={styles.firstImg}
            />
            <div className={styles.titlesBox}>
              <TitleDescription
                title="For the best results..."
                description="Use a photo with good lighting, stand straight a plain background"
              />
            </div>
          </div>
          <div
            className={`${styles.step} ${styles.unactiveStep} ${
              onboardingSteps === 2
                ? styles.activeStep
                : onboardingSteps > 2
                  ? styles.unactiveActiveStep
                  : ''
            }`}
          >
            <Consent setIsChecked={setIsChecked} />
          </div>
        </div>
      )}
      {!isMobile && (
        <TryOnButton
          disabled={onboardingSteps == 2 && !isChecked}
          onClick={handleClickOnboardingButton}
        >
          {onboardingSteps === 2 ? 'Start' : ' Next'}
        </TryOnButton>
      )}
    </div>
  ) : (
    <></>
  )
}
