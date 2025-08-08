import React from "react";
// types
import { SectionTypes } from "./types";

import styles from "./section.module.scss";

export const Section = (props: SectionTypes) => {
  const { children, className } = props;

  return (
    <section className={`${styles.sectionContent} ${className ?? ""}`}>
      {children}
    </section>
  );
};
