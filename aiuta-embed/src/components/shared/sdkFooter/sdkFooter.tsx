import { usePathname } from "next/navigation";

// redux
import { useAppSelector } from "@lib/redux/store";

// selectors
import {
  isMobileSelector,
  isShowFooterSelector,
} from "@lib/redux/slices/configSlice/selectors";

// styles
import styles from "./sdkFooter.module.scss";

export const SdkFooter = () => {
  const pathName = usePathname();

  const isMobile = useAppSelector(isMobileSelector);
  const isShowFooter = useAppSelector(isShowFooterSelector);

  const iasNavigatePath =
    pathName === "/view" ||
    pathName === "/history" ||
    pathName === "/previously" ||
    pathName === "/generated";

  const iasNavigateMobilePath =
    pathName === "/history" || pathName === "/previously";

  return !isMobile ? (
    <footer
      className={`${styles.footer} ${iasNavigatePath ? styles.hideFooter : ""}`}
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
