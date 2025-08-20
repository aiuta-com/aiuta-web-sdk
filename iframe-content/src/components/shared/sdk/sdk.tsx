import React from "react";

// redux
import { useAppSelector } from "@lib/redux/store";

// selectors
import { stylesConfigurationSelector } from "@lib/redux/slices/configSlice/selectors";

// components
import { Layout } from "@/components/feature";
import { Onboarding } from "@/components/shared";
import { Section } from "@/components/feature/section/section";

import styles from "./sdk.module.scss";

export const Sdk = () => {
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  return (
    <Layout>
      <Section
        className={`${styles.onboardingSection} ${stylesConfiguration.pages.onboardingPageClassName}`}
      >
        <Onboarding />
      </Section>
    </Layout>
  );
};
