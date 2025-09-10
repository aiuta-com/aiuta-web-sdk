import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { configSlice } from '@lib/redux/slices/configSlice'
import {
  aiutaEndpointDataSelector,
  onboardingStepsSelector,
} from '@lib/redux/slices/configSlice/selectors'
import { Consent } from './components/consent/consent'
import { TitleDescription, TryOnButton } from '@/components/feature'

// types

// messaging

// rpc
import { useRpcProxy } from '@/contexts'

// styles
import styles from './onboarding.module.scss'

const INITIALLY_ONBOARDING = [
  {
    imageUrl: './images/mobileFirstOnboarding.png',
    miniImageUrl: './images/mobileFirstMini.png',
  },
  {
    imageUrl: './images/mobileMiddleOnboarding.png',
    miniImageUrl: './images/mobileMiddleMini.png',
  },
  {
    imageUrl: './images/mobileLastOnboarding.png',
    miniImageUrl: './images/mobileLastMini.png',
  },
]

export const OnboardingMobile = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpcProxy()

  const [isChecked, setIsChecked] = useState(false)
  const [initiallyOnboardingStep, setInitiallyOnboardingStep] = useState(0)

  const onboardingSteps = useAppSelector(onboardingStepsSelector)
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector)

  const handleOnboardAnalyticFinish = () => {
    const analytic = {
      data: {
        type: 'onboarding',
        pageId: 'consent',
        event: 'onboardingFinished',
        productIds: [aiutaEndpointData.skuId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  const handleClickOnboardingButton = () => {
    if (initiallyOnboardingStep !== 2) {
      setInitiallyOnboardingStep((prevState) => prevState + 1)
    } else {
      if (onboardingSteps !== 2) {
        dispatch(configSlice.actions.setOnboardingSteps(null))
      } else {
        navigate('/view')
        handleOnboardAnalyticFinish()
        dispatch(configSlice.actions.setIsShowFooter(true))
        dispatch(configSlice.actions.setIsOnboardingDone(true))
        localStorage.setItem('isOnboarding', JSON.stringify(true))
      }
    }
  }

  const initaillAnalytic = () => {
    if (aiutaEndpointData.skuId && aiutaEndpointData.skuId.length > 0) {
      const analytic = {
        data: {
          type: 'page',
          pageId: 'howItWorks',
          productIds: [aiutaEndpointData.skuId],
        },
      }

      rpc.sdk.trackEvent(analytic)
    }
  }

  const initPageAnalytic = (analytic: any) => {
    rpc.sdk.trackEvent(analytic)
  }

  useEffect(() => {
    const isOnboarding = JSON.parse(localStorage.getItem('isOnboarding') || 'false')

    if (!isOnboarding) {
      if (!onboardingSteps) {
        initaillAnalytic()
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

  return (
    <div className={styles.onboardingMobile}>
      {onboardingSteps !== 2 && <div />}
      <div className={styles.obboardingStepBox}>
        <div
          className={`${styles.step} ${styles.firstStep} ${
            onboardingSteps > 0 ? styles.unactiveActiveStep : ''
          }`}
        >
          <div className={styles.titlesBoxMobile}>
            <TitleDescription
              title="Try on before buying"
              description="Just upload your photo and see how it looks"
            />
          </div>
          <div className={styles.initiallyBoardingStep}>
            <div className={styles.miniImagesBox}>
              {INITIALLY_ONBOARDING.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.imageBanner} ${
                    initiallyOnboardingStep === index ? styles.imageBannerActive : ''
                  }`}
                >
                  <img
                    loading="lazy"
                    alt="Onboarding image"
                    src={image.miniImageUrl}
                    className={styles.firstImg}
                  />
                </div>
              ))}
            </div>
            <img
              loading="lazy"
              alt="Onboarding image"
              className={styles.firstImg}
              src={INITIALLY_ONBOARDING[initiallyOnboardingStep].imageUrl}
            />
          </div>
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
          <div className={styles.titlesBoxMobile}>
            <TitleDescription
              className={styles.largeTilte}
              title="For the best results"
              description="Use a photo with good lighting, stand straight a plain background"
            />
          </div>
          <img
            loading="lazy"
            alt="Onboarding image"
            className={styles.firstImg}
            src="./images/mobileLastStepOnboarding.png"
          />
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
          <div className={styles.consentContent}>
            <Consent setIsChecked={setIsChecked} />
          </div>
        </div>
      </div>
      <TryOnButton
        disabled={onboardingSteps == 2 && !isChecked}
        onClick={handleClickOnboardingButton}
      >
        {onboardingSteps === 2 ? 'Start' : ' Next'}
      </TryOnButton>
    </div>
  )
}
