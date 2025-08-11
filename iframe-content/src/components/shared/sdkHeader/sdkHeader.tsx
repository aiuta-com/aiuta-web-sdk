import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// redux
import { useAppDispatch, useAppSelector } from "@lib/redux/store";

// actions
import { generateSlice } from "@lib/redux/slices/generateSlice";
import { configSlice } from "@lib/redux/slices/configSlice";

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
} from "@lib/redux/slices/generateSlice/selectors";

// styles
import styles from "./sdkHeader.module.scss";

export const SdkHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useAppDispatch();

  const qrToken = useAppSelector(qrTokenSelector);
  const isMobile = useAppSelector(isMobileSelector);
  const selectedImages = useAppSelector(selectedImagesSelector);
  const generatedImages = useAppSelector(generatedImagesSelector);
  const isOnboardingDone = useAppSelector(isOnboardingDoneSelector);
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector);

  const [hasMounted, setHasMounted] = useState(false);
  const [headerText, setHeaderText] = useState("Virtual Try-On");

  const pathName = location.pathname;

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
          navigate(-1);
        }, 100);
      } else {
        if (isMobile) {
          if (!hasHistoryImages) {
            navigate("/view");
          } else {
            navigate(-1);
          }
        } else {
          if (generatedImages.length === 0) {
            navigate("/view");
          } else {
            navigate(-1);
          }
        }
      }
    } else {
      navigate(`/${path}`);
    }
  };

  useEffect(() => {
    if (pathName === "/history") {
      setHeaderText("History");
    } else if (pathName === "/previously") {
      setHeaderText("Previously used photos");
    } else {
      setHeaderText("Virtual Try-On");
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
          <img
            alt="History icon"
            src={iasNavigatePath ? './icons/back.svg' : './icons/history.svg'}
            onClick={() => handleNavigate("history")}
          />
        ) : iasNavigatePath ? (
          <img
            alt="History icon"
            src={'./icons/back.svg'}
            onClick={() => handleNavigate("history")}
          />
        ) : null
      ) : hasHistoryImages ? (
        <img
          alt="History icon"
          src={iasNavigatePath ? './icons/back.svg' : 'icons/history.svg'}
          onClick={() => handleNavigate("history")}
        />
      ) : iasNavigatePath ? (
        <img
          alt="History icon"
          src={'./icons/back.svg'}
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
        <img alt="History icon" src={'./icons/close.svg'} onClick={handleCloseModal} />
      ) : null}
    </header>
  );
};
