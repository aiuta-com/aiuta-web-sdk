import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// redux
import { useAppDispatch, useAppSelector } from "@lib/redux/store";

// actions
import { alertSlice } from "@lib/redux/slices/alertSlice";
import { configSlice } from "@lib/redux/slices/configSlice";
import { generateSlice } from "@lib/redux/slices/generateSlice";

// selectors
import {
  qrTokenSelector,
  isMobileSelector,
  onboardingStepsSelector,
  isOnboardingDoneSelector,
  aiutaEndpointDataSelector,
  stylesConfigurationSelector,
  isSelectHistoryImagesSelector,
  isSelectPreviouselyImagesSelector,
} from "@lib/redux/slices/configSlice/selectors";
import {
  selectedImagesSelector,
  recentlyPhotosSelector,
  generatedImagesSelector,
  isStartGenerationSelector,
} from "@lib/redux/slices/generateSlice/selectors";

// types
import { AnalyticEventsEnum } from "@/types";

// styles
import styles from "./sdkHeader.module.scss";

export const SdkHeader = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const location = useLocation();

  const qrToken = useAppSelector(qrTokenSelector);
  const isMobile = useAppSelector(isMobileSelector);
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector);
  const selectedImages = useAppSelector(selectedImagesSelector);
  const onboardingSteps = useAppSelector(onboardingStepsSelector);
  const generatedImages = useAppSelector(generatedImagesSelector);
  const isOnboardingDone = useAppSelector(isOnboardingDoneSelector);
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector);
  const isStartGeneration = useAppSelector(isStartGenerationSelector);
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector);
  const isSelectPreviouselyImages = useAppSelector(
    isSelectPreviouselyImagesSelector
  );

  const [hasMounted, setHasMounted] = useState(false);
  const [headerText, setHeaderText] = useState("Virtual Try-On");

  const pathName = location.pathname;
  const hasHistoryImages = generatedImages.length > 0;
  const hasRecentlyPhotos = recentlyPhotos.length > 0;
  const isCheckOnboardingForMobile = isMobile && isOnboardingDone;
  const isCheckQrTokenPage = qrToken ? pathName.includes(qrToken) : false;
  const iasNavigatePath = pathName === "/history" || pathName === "/previously";
  const iasNavigatePathMobile =
    pathName === "/history" || pathName === "/previously";

  const handleAnalytic = () => {
    const analytic = {
      data: {
        type: "exit",
        pageId: "howItWorks",
        productIds: [aiutaEndpointData?.skuId],
      },
      localDateTime: Date.now(),
    };

    if (pathName === "/") {
      if (onboardingSteps === 1) {
        analytic.data.pageId = "bestResults";
      } else if (onboardingSteps === 2) {
        analytic.data.pageId = "consent";
      }
    } else if (pathName === "/view") {
      return;
    } else if (pathName === "/qr") {
      analytic.data.pageId = "imagePicker";
    } else if (pathName === "/generated") {
      analytic.data.pageId = "results";
    }

    window.parent.postMessage(
      { action: AnalyticEventsEnum.closeModal, analytic },
      "*"
    );
  };

  const handleCloseModal = () => {
    if (typeof window !== "undefined") {
      const recentPhotosFromLocal = JSON.parse(
        localStorage.getItem("tryon-recent-photos") || "[]"
      );

      if (isStartGeneration) {
        const analytic = {
          data: {
            type: "exit",
            pageId: "loading",
            productIds: [aiutaEndpointData?.skuId],
          },
          localDateTime: Date.now(),
        };

        window.parent.postMessage(
          { action: AnalyticEventsEnum.closeModal, analytic },
          "*"
        );

        window.parent.postMessage({ action: "close_modal" }, "*");
        return;
      }

      if (recentPhotosFromLocal.length > 0) {
        setTimeout(() => {
          navigate("/view");
        }, 500);
      }
      window.parent.postMessage({ action: "close_modal" }, "*");
    }

    handleAnalytic();
    dispatch(alertSlice.actions.setShowAlert({ isShow: false }));
  };

  const handleToggleHistorySelectImages = () => {
    if (pathName === "/previously") {
      dispatch(
        configSlice.actions.setIsSelectPreviouselyImages(
          !isSelectPreviouselyImages
        )
      );
    } else if (pathName === "/history") {
      dispatch(
        configSlice.actions.setIsSelectHistoryImages(!isSelectHistoryImages)
      );
    }
  };

  const handleNavigate = (path: string) => {
    if (pathName === "/history" && iasNavigatePath) {
      const analytic = {
        data: {
          type: "exit",
          pageId: "history",
          productIds: [aiutaEndpointData?.skuId],
        },
        localDateTime: Date.now(),
      };

      window.parent.postMessage(
        { action: AnalyticEventsEnum.history, analytic },
        "*"
      );
    }

    if (iasNavigatePath) {
      if (recentlyPhotos.length === 0) {
        navigate("/qr");
      } else if (selectedImages.length > 0) {
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

    dispatch(configSlice.actions.setIsSelectHistoryImages(false));
    dispatch(configSlice.actions.setIsSelectPreviouselyImages(false));
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        if (event.data.status === 200 && event.data.type === "baseKeys") {
          dispatch(configSlice.actions.setAiutaEndpointData(event.data));
        }
      } else if (event.data.action === "ANALYTIC_SOCIAL_MEDIA") {
        const analytic: any = {
          data: {
            type: "share",
            pageId: "results",
            event: "succeded",
            targetId: "whatsApp",
            productIds: [aiutaEndpointData?.skuId],
          },
          localDateTime: Date.now(),
        };

        if (event.data.shareMethod === "whatsApp") {
          analytic.data.targetId = "whatsApp";
        } else if (event.data.shareMethod === "messenger") {
          analytic.data.targetId = "messenger";
        } else if (event.data.shareMethod === "copy") {
          analytic.data.targetId = "copy";
        } else if (event.data.shareMethod === "share_close") {
          delete analytic.data["targetId"];
          analytic.data.event = "canceled";
        }

        window.parent.postMessage(
          { action: AnalyticEventsEnum.results, analytic },
          "*"
        );
      } else {
        console.error("Not found API data");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [aiutaEndpointData]);

  if (!hasMounted) return null;

  return (
    <header
      className={`${styles.sdkHeader} ${
        isMobile ? styles.sdkHeaderMobile : ""
      } ${stylesConfiguration.components.headerClassName}`}
    >
      {!isMobile && !isCheckQrTokenPage ? (
        hasHistoryImages ? (
          <img
            alt="History icon"
            src={iasNavigatePath ? "./icons/back.svg" : "./icons/history.svg"}
            onClick={() => handleNavigate("history")}
          />
        ) : iasNavigatePath ? (
          <img
            alt="History icon"
            src={"./icons/back.svg"}
            onClick={() => handleNavigate("history")}
          />
        ) : null
      ) : hasHistoryImages ? (
        <img
          alt="History icon"
          src={iasNavigatePath ? "./icons/back.svg" : "icons/history.svg"}
          onClick={() => handleNavigate("history")}
        />
      ) : iasNavigatePath ? (
        <img
          alt="History icon"
          src={"./icons/back.svg"}
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
      {iasNavigatePathMobile && (hasHistoryImages || hasRecentlyPhotos) ? (
        <p
          className={`${styles.historyText} ${
            isSelectHistoryImages || isSelectPreviouselyImages
              ? styles.historyTextUnactive
              : ""
          }`}
          onClick={handleToggleHistorySelectImages}
        >
          Select
        </p>
      ) : !isCheckQrTokenPage ? (
        <img
          alt="History icon"
          src={"./icons/close.svg"}
          onClick={handleCloseModal}
        />
      ) : null}
    </header>
  );
};
