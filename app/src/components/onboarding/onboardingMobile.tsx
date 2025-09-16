import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'
import { onboardingSlice } from '@/store/slices/onboardingSlice'
import {
  onboardingCurrentStepSelector,
  onboardingIsCompletedSelector,
} from '@/store/slices/onboardingSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { Consent } from './components/consent/consent'
import { PrimaryButton } from '@/components'
import { useRpcProxy } from '@/contexts'
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

  const onboardingSteps = useAppSelector(onboardingCurrentStepSelector)
  const isOnboardingDone = useAppSelector(onboardingIsCompletedSelector)
  const productId = useAppSelector(productIdSelector)

  const handleOnboardAnalyticFinish = () => {
    const analytic = {
      data: {
        type: 'onboarding',
        pageId: 'consent',
        event: 'onboardingFinished',
        productIds: [productId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  const handleClickOnboardingButton = () => {
    if (initiallyOnboardingStep !== 2) {
      setInitiallyOnboardingStep((prevState) => prevState + 1)
    } else {
      if (onboardingSteps !== 2) {
        dispatch(onboardingSlice.actions.nextStep())
      } else {
        navigate('/view')
        handleOnboardAnalyticFinish()
        dispatch(appSlice.actions.setHasFooter(true))
        dispatch(onboardingSlice.actions.setIsCompleted(true))
      }
    }
  }

  const initaillAnalytic = () => {
    if (productId && productId.length > 0) {
      const analytic = {
        data: {
          type: 'page',
          pageId: 'howItWorks',
          productIds: [productId],
        },
      }

      rpc.sdk.trackEvent(analytic)
    }
  }

  const initPageAnalytic = (analytic: any) => {
    rpc.sdk.trackEvent(analytic)
  }

  useEffect(() => {
    if (!isOnboardingDone) {
      if (!onboardingSteps) {
        initaillAnalytic()
      } else if (onboardingSteps === 1) {
        const analytic = {
          data: {
            type: 'page',
            pageId: 'bestResults',
            productIds: [productId],
          },
        }

        initPageAnalytic(analytic)
      } else if (onboardingSteps === 2) {
        const analytic = {
          data: {
            type: 'page',
            pageId: 'consent',
            productIds: [productId],
          },
        }

        initPageAnalytic(analytic)
      }
    }
  }, [productId, onboardingSteps])

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
            <h2>Try on before buying</h2>
            <h3>Just upload your photo and see how it looks</h3>
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
            <h2 className={styles.largeTilte}>For the best results</h2>
            <h3>Use a photo with good lighting, stand straight a plain background</h3>
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
            <Consent isChecked={isChecked} setIsChecked={setIsChecked} />
          </div>
        </div>
      </div>
      <PrimaryButton
        disabled={onboardingSteps == 2 && !isChecked}
        onClick={handleClickOnboardingButton}
      >
        {onboardingSteps === 2 ? 'Start' : ' Next'}
      </PrimaryButton>
    </div>
  )
}
