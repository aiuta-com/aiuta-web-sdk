import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@lib/redux/store";
import { configSlice } from "@lib/redux/slices/configSlice";
import { onboardingStepsSelector } from "@lib/redux/slices/configSlice/selectors";
import { Consent } from "./components/consent/consent";
import { TitleDescription, TryOnButton } from "@/components/feature";

// types
import { AnalyticEventsEnum } from "@/types";

// styles
import styles from "./onboarding.module.scss";

const INITIALLY_ONBOARDING = [
  {
    imageUrl: "./images/mobileFirstOnboarding.png",
    miniImageUrl: "./images/mobileFirstMini.png",
  },
  {
    imageUrl: "./images/mobileMiddleOnboarding.png",
    miniImageUrl: "./images/mobileMiddleMini.png",
  },
  {
    imageUrl: "./images/mobileLastOnboarding.png",
    miniImageUrl: "./images/mobileLastMini.png",
  },
];

export const OnboardingMobile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isChecked, setIsChecked] = useState(false);
  const [initiallyOnboardingStep, setInitiallyOnboardingStep] = useState(0);

  const onboardingSteps = useAppSelector(onboardingStepsSelector);

  const handleClickOnboardingButton = () => {
    if (initiallyOnboardingStep !== 2) {
      setInitiallyOnboardingStep((prevState) => prevState + 1);
    } else {
      if (onboardingSteps !== 2) {
        dispatch(configSlice.actions.setOnboardingSteps(null));
      } else {
        navigate("/view");
        dispatch(configSlice.actions.setIsShowFooter(true));
        dispatch(configSlice.actions.setIsOnboardingDone(true));
        localStorage.setItem("isOnboarding", JSON.stringify(true));
      }
    }
  };

  const onboardingAnalytic = useCallback(() => {
    const analytic = {
      data: {
        type: "onboarding",
        event: "welcomeStartClicked",
        pageId: "onboarding",
      },
      localDateTime: Date.now(),
    };

    window.parent.postMessage(
      { action: AnalyticEventsEnum.onboarding, analytic },
      "*"
    );
  }, []);

  useEffect(() => {
    onboardingAnalytic();
    // eslint-disable-next-line
  }, []);

  return (
    <div className={styles.onboardingMobile}>
      <div className={styles.obboardingStepBox}>
        <div
          className={`${styles.step} ${styles.firstStep} ${
            onboardingSteps > 0 ? styles.unactiveActiveStep : ""
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
                    initiallyOnboardingStep === index
                      ? styles.imageBannerActive
                      : ""
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
              : ""
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
              : ""
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
        {onboardingSteps === 2 ? "Start" : " Next"}
      </TryOnButton>
    </div>
  );
};
