import React from "react";

// redux
import { useAppSelector } from "@lib/redux/store";

// selectors
import {
  isMobileSelector,
  isShowFooterSelector,
  stylesConfigurationSelector,
} from "@lib/redux/slices/configSlice/selectors";

// styles
import styles from "./sdkFooter.module.scss";
import { useEffect, useState } from "react";

export const SdkFooter = () => {
  const [pathName, setPathName] = useState("");

  useEffect(() => {
    setPathName(window.location.pathname);
  }, []);

  const isMobile = useAppSelector(isMobileSelector);
  const isShowFooter = useAppSelector(isShowFooterSelector);
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  const iasNavigatePath =
    pathName === "/view" ||
    pathName === "/history" ||
    pathName === "/previously" ||
    pathName === "/generated";

  const iasNavigateMobilePath =
    pathName === "/history" || pathName === "/previously";

  return !isMobile ? (
    <footer
      className={`${styles.footer} ${
        iasNavigatePath ? styles.hideFooter : ""
      } ${stylesConfiguration.components.footerClassName}`}
    >
      <p className={styles.linkingText}>
        Powered{" "}
        <a target="_blank" href="https://www.aiuta.com/">
          by Aiuta
        </a>
      </p>
    </footer>
  ) : isMobile && isShowFooter ? (
    <footer
      className={`${styles.footer} ${
        iasNavigateMobilePath ? styles.hideFooter : ""
      }`}
    >
      <p className={styles.linkingText}>
        Powered{" "}
        <a target="_blank" href="https://www.aiuta.com/">
          by Aiuta
        </a>
      </p>
    </footer>
  ) : (
    <></>
  );
};
