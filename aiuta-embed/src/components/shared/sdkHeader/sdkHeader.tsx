"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

// redux
import { useAppDispatch, useAppSelector } from "@lib/redux/store";

// actions
import { generateSlice } from "@lib/redux/slices/generateSlice";

// selectors
import {
  qrTokenSelector,
  isMobileSelector,
  isOnboardingDoneSelector,
  isSelectHistoryImagesSelector,
} from "@lib/redux/slices/configSlice/selectors";
import {
  generatedImagesSelector,
  selectedImagesSelector,
  // generatedImagesSelector,
} from "@lib/redux/slices/generateSlice/selectors";

// icons
import { backIcon, closeIcon, historyIcon } from "../../../../public/icons";

// styles
import styles from "./sdkHeader.module.scss";
import { configSlice } from "@lib/redux/slices/configSlice";

export const SdkHeader = () => {
  const router = useRouter();
  const pathName = usePathname();

  const dispatch = useAppDispatch();

  const qrToken = useAppSelector(qrTokenSelector);
  const isMobile = useAppSelector(isMobileSelector);
  const selectedImages = useAppSelector(selectedImagesSelector);
  const generatedImages = useAppSelector(generatedImagesSelector);
  const isOnboardingDone = useAppSelector(isOnboardingDoneSelector);
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector);

  const [hasMounted, setHasMounted] = useState(false);
  const [headerText, setHeaderText] = useState("Virtual Try-On");

  const hasHistoryImages = generatedImages.length > 0;
  const isCheckOnboardingForMobile = isMobile && isOnboardingDone;
  const isCheckQrTokenPage = qrToken ? pathName.includes(qrToken) : false;
  const iasNavigatePath = pathName === "/history" || pathName === "/previously";
  const iasNavigatePathMobile = pathName === "/history";

  const handleCloseModal = () => {
    if (typeof window !== "undefined") {
      window.parent.postMessage({ action: "close_modal" }, "*");
    }
  };

  const handleToggleHistorySelectImages = () => {
    dispatch(
      configSlice.actions.setIsSelectHistoryImages(!isSelectHistoryImages)
    );
  };

  const handleNavigate = (path: string) => {
    if (iasNavigatePath) {
      if (selectedImages.length > 0) {
        dispatch(generateSlice.actions.setSelectedImage([]));

        setTimeout(() => {
          router.back();
        }, 100);
      } else {
        if (isMobile) {
          if (!hasHistoryImages) {
            router.push("/view");
          } else {
            router.back();
          }
        } else {
          if (generatedImages.length === 0) {
            router.push("/view");
          } else {
            router.back();
          }
        }
      }
    } else {
      router.push(`/${path}`);
    }
  };

  useEffect(() => {
    if (pathName === "/history") {
      return setHeaderText("History");
    } else if (pathName === "/previously") {
      return setHeaderText("Previously used photos");
    } else {
      return setHeaderText("Virtual Try-On");
    }
  }, [pathName]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <header
      className={`${styles.sdkHeader} ${
        isMobile ? styles.sdkHeaderMobile : ""
      }`}
    >
      {!isMobile && !isCheckQrTokenPage ? (
        hasHistoryImages ? (
          <Image
            alt="History icon"
            src={iasNavigatePath ? backIcon : historyIcon}
            onClick={() => handleNavigate("history")}
          />
        ) : iasNavigatePath ? (
          <Image
            alt="History icon"
            src={backIcon}
            onClick={() => handleNavigate("history")}
          />
        ) : null
      ) : hasHistoryImages ? (
        <Image
          alt="History icon"
          src={iasNavigatePath ? backIcon : historyIcon}
          onClick={() => handleNavigate("history")}
        />
      ) : iasNavigatePath ? (
        <Image
          alt="History icon"
          src={backIcon}
          onClick={() => handleNavigate("history")}
        />
      ) : null}
      {!isMobile && (
        <div className={styles.titleBox}>
          <p className={styles.title}>{headerText}</p>
        </div>
      )}
      {isCheckOnboardingForMobile && (
        <div className={styles.titleBox}>
          <p className={styles.title}>{headerText}</p>
        </div>
      )}
      {isMobile && iasNavigatePathMobile ? (
        <p
          className={`${styles.historyText} ${
            isSelectHistoryImages ? styles.historyTextUnactive : ""
          }`}
          onClick={handleToggleHistorySelectImages}
        >
          Select
        </p>
      ) : !isCheckQrTokenPage ? (
        <Image alt="History icon" src={closeIcon} onClick={handleCloseModal} />
      ) : null}
    </header>
  );
};
