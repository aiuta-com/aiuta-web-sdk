import React from "react";
// components
import { Layout } from "@/components/feature";
import { Section } from "@/components/feature/section/section";
import { Onboarding } from "@/components/shared";

import styles from "./sdk.module.scss";

export const Sdk = () => {
  return (
      <Layout>
        <Section className={styles.onboardingSection}>
          <Onboarding />
        </Section>
      </Layout>
  );
};
