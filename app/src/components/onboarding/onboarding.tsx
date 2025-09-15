import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
// import { appSlice } from '@/store/slices/appSlice' // TODO: Remove if unused
import { onboardingSlice } from '@/store/slices/onboardingSlice'
import { isMobileSelector, isInitializedSelector, isLoadingSelector } from '@/store/slices/appSlice'
import {
  onboardingCurrentStepSelector,
  onboardingIsCompletedSelector,
} from '@/store/slices/onboardingSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { OnboardingMobile } from './onboardingMobile'
import { Consent } from './components/consent/consent'
import { TitleDescription, TryOnButton } from '@/components'
import { useRpcProxy } from '@/contexts'
import styles from './onboarding.module.scss'

export const Onboarding = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpcProxy()

  const [isChecked, setIsChecked] = useState(false)

  const isMobile = useAppSelector(isMobileSelector)
  const isShowSpinner = useAppSelector(isLoadingSelector)
  const isInitialized = useAppSelector(isInitializedSelector)
  const onboardingSteps = useAppSelector(onboardingCurrentStepSelector)
  const isOnboardingDone = useAppSelector(onboardingIsCompletedSelector)
  const productId = useAppSelector(productIdSelector)

  const onboardingAnalytic = () => {
    const analytic = {
      data: {
        type: 'onboarding',
        pageId: 'consent',
        event: 'consentsGiven',
        productIds: [productId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

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
    if (onboardingSteps !== 2) {
      dispatch(onboardingSlice.actions.nextStep())
    } else {
      navigate('/qr')
      onboardingAnalytic()
      handleOnboardAnalyticFinish()
      dispatch(onboardingSlice.actions.setIsCompleted(true))
    }
  }

  const initPageAnalytic = (analytic: any) => {
    if (productId && productId.length > 0) {
      rpc.sdk.trackEvent(analytic)
    }
  }

  useEffect(() => {
    if (!isOnboardingDone) {
      if (onboardingSteps === 0) {
        const analytic = {
          data: {
            type: 'page',
            pageId: 'howItWorks',
            productIds: [productId],
          },
        }

        initPageAnalytic(analytic)
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
            <Consent isChecked={isChecked} setIsChecked={setIsChecked} />
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
