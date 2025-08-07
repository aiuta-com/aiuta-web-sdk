import { useState } from "react";
import Image from "next/image";

import { useRouter } from "next/navigation";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { configSlice } from "@lib/redux/slices/configSlice";

// selectors
import { onboardingStepsSelector } from "@lib/redux/slices/configSlice/selectors";

// components
import { Consent } from "./components/consent/consent";
import { TitleDescription, TryOnButton } from "@/components/feature";

// images
import {
  mobileLastMiniImg,
  mobileFirstMiniImg,
  mobileMiddleMiniImg,
  mobileLastOnboardingImg,
  mobileFirstOnboardingImg,
  mobileMiddleOnboardingImg,
  mobileLastStepOnboardingImg,
} from "../../../../public/images";

const INITIALLY_ONBOARDING = [
  { imageUrl: mobileFirstOnboardingImg, miniImageUrl: mobileFirstMiniImg },
  { imageUrl: mobileMiddleOnboardingImg, miniImageUrl: mobileMiddleMiniImg },
  { imageUrl: mobileLastOnboardingImg, miniImageUrl: mobileLastMiniImg },
];

// styles
import styles from "./onboarding.module.scss";

export const OnboardingMobile = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [isChecked, setIsChecked] = useState(false);
  const [initiallyOnboardingStep, setInitiallyOnboardingStep] = useState(0);

  const onboardingSteps = useAppSelector(onboardingStepsSelector);

  const handleClickOnboardingButton = () => {
    if (initiallyOnboardingStep !== 2) {
      setInitiallyOnboardingStep((prevState) => (prevState += 1));
    } else {
      if (onboardingSteps !== 2) {
        dispatch(configSlice.actions.setOnboardingSteps(null));
      } else {
        router.push("/view");
        dispatch(configSlice.actions.setIsShowFooter(true));
        dispatch(configSlice.actions.setIsOnboardingDone(true));
        localStorage.setItem("isOnboarding", JSON.stringify(true));
      }
    }
  };

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
                  <Image
                    loading="lazy"
                    alt="Onboarding image"
                    src={image.miniImageUrl}
                    className={styles.firstImg}
                  />
                </div>
              ))}
            </div>
            <Image
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
          <Image
            loading="lazy"
            alt="Onboarding image"
            className={styles.firstImg}
            src={mobileLastStepOnboardingImg}
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
