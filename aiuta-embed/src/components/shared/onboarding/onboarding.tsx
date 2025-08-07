import { useState } from "react";
import Image from "next/image";

import { useRouter } from "next/navigation";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { configSlice } from "@lib/redux/slices/configSlice";

// selectors
import {
  isMobileSelector,
  isInitializedSelector,
  isShowSpinnerSelector,
  onboardingStepsSelector,
} from "@lib/redux/slices/configSlice/selectors";

// components
import { OnboardingMobile } from "./onboardingMobile";
import { Consent } from "./components/consent/consent";
import { TitleDescription, TryOnButton } from "@/components/feature";

// images
import {
  lastOnboardingImg,
  firstOnboardingImg,
} from "../../../../public/images";

// styles
import styles from "./onboarding.module.scss";

export const Onboarding = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [isChecked, setIsChecked] = useState(false);

  const isMobile = useAppSelector(isMobileSelector);
  const isShowSpinner = useAppSelector(isShowSpinnerSelector);
  const isInitialized = useAppSelector(isInitializedSelector);
  const onboardingSteps = useAppSelector(onboardingStepsSelector);

  const handleClickOnboardingButton = () => {
    if (onboardingSteps !== 2) {
      dispatch(configSlice.actions.setOnboardingSteps(null));
    } else {
      router.push("/qr");
      localStorage.setItem("isOnboarding", JSON.stringify(true));
    }
  };

  return !isShowSpinner && isInitialized ? (
    <div className={styles.onboarding}>
      {isMobile ? (
        <OnboardingMobile />
      ) : (
        <div className={styles.obboardingStepBox}>
          <div
            className={`${styles.step} ${styles.firstStep} ${
              onboardingSteps > 0 ? styles.unactiveActiveStep : ""
            }`}
          >
            <>
              <Image
                loading="lazy"
                alt="Onboarding image"
                src={firstOnboardingImg}
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
                : ""
            }`}
          >
            <Image
              loading="lazy"
              alt="Onboarding image"
              src={lastOnboardingImg}
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
                : ""
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
          {onboardingSteps === 2 ? "Start" : " Next"}
        </TryOnButton>
      )}
    </div>
  ) : (
    <></>
  );
};
