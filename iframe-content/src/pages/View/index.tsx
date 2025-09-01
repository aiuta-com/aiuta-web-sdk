import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { motion, easeInOut } from "framer-motion";

// redux
import { useAppSelector, useAppDispatch } from "../../../lib/redux/store";

// actions
import { alertSlice } from "@lib/redux/slices/alertSlice";
import { generateSlice } from "../../../lib/redux/slices/generateSlice";

// selectors
import {
  isMobileSelector,
  stylesConfigurationSelector,
} from "@lib/redux/slices/configSlice/selectors";
import { uploadedViewFileSelector } from "@lib/redux/slices/fileSlice/selectors";
import {
  recentlyPhotosSelector,
  isStartGenerationSelector,
} from "../../../lib/redux/slices/generateSlice/selectors";

// components
import {
  Alert,
  Section,
  ViewImage,
  TryOnButton,
  SecondaryButton,
} from "@/components/feature";
import ViewMobile from "./viewMobile";
import { AiutaModal } from "@/components/shared/modals";

// types
import { AnalyticEventsEnum, EndpointDataTypes } from "@/types";

// styles
import styles from "./view.module.scss";

let generationApiCallInterval: NodeJS.Timeout | null = null;

const initiallAnimationConfig = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
  transition: {
    duration: 0.3,
    ease: easeInOut,
  },
};

export default function View() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isOpenAbortedModal, setIsOpenAbortedModal] = useState(false);
  const [recentlyPhoto, setRecentlyPhoto] = useState({ id: "", url: "" });
  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
  );

  const isMobile = useAppSelector(isMobileSelector);
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector);
  const uploadedViewFile = useAppSelector(uploadedViewFileSelector);
  const isStartGeneration = useAppSelector(isStartGenerationSelector);
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  const handleNavigate = (path: string) => {
    navigate(`/${path}`);
  };

  const handlePutRecentlyPhotos = (
    id: string,
    url: string,
    storageKey: string
  ) => {
    const uploadedPhotos = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const newUploadedPhoto = { id, url };
    const newPhotos = [newUploadedPhoto, ...uploadedPhotos];

    dispatch(generateSlice.actions.setRecentlyPhotos(newPhotos));
    localStorage.setItem(storageKey, JSON.stringify(newPhotos));
  };

  const handleGetGeneratedImage = async (operation_id: string) => {
    try {
      const response = await fetch(
        `https://web-sdk.aiuta.com/api/sku-image-operation`,
        {
          method: "POST",
          body: JSON.stringify({ ...endpointData, operation_id: operation_id }),
        }
      );

      if (!response.ok) return;

      const result = await response.json();

      if (result.status === "SUCCESS") {
        const { generated_images } = result;
        const { id, url } = generated_images[0];

        setGeneratedImageUrl(url);
        handleNavigate("generated");
        setTimeout(() => {
          dispatch(generateSlice.actions.setIsStartGeneration(false));
        }, 500);

        dispatch(generateSlice.actions.setGeneratedImage({ id, url }));

        const analytic = {
          data: {
            type: "tryOn",
            event: "initiated",
            pageId: "imagePicker",
            productIds: [endpointData?.skuId],
          },
          localDateTime: Date.now(),
        };

        window.parent.postMessage(
          { action: AnalyticEventsEnum.tryOn, analytic },
          "*"
        );

        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval);
          generationApiCallInterval = null;
        }
      } else if (result.status === "FAILED" || result.status === "CANCELLED") {
        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval);
          generationApiCallInterval = null;
        }

        dispatch(generateSlice.actions.setIsStartGeneration(false));
        dispatch(
          alertSlice.actions.setShowAlert({
            type: "error",
            isShow: true,
            buttonText: "Try again",
            content: "Something went wrong. Please try again",
          })
        );

        const analytic = {
          data: {
            type: "tryOn",
            event: "tryOnError",
            pageId: "tryOn",
            productIds: [endpointData?.skuId],
          },
          localDateTime: Date.now(),
        };

        window.parent.postMessage(
          { action: AnalyticEventsEnum.tryOnError, analytic },
          "*"
        );
      } else if (result.status === "ABORTED") {
        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval);
          generationApiCallInterval = null;
        }

        dispatch(generateSlice.actions.setIsStartGeneration(false));
        setIsOpenAbortedModal(true);

        const analytic = {
          data: {
            type: "tryOn",
            event: "tryOnAborted",
            pageId: "tryOn",
            productIds: [endpointData?.skuId],
          },
          localDateTime: Date.now(),
        };

        window.parent.postMessage(
          { action: AnalyticEventsEnum.tryOnAborted, analytic },
          "*"
        );
      }
    } catch (err) {
      console.error("Generation image Error:", err);
    }
  };

  const handleGenerate = async (event: any) => {
    if (event.data.status === 200 && event.data.type === "baseKeys") {
      const isExistUploadedPhoto = uploadedViewFile.id.length;
      const uploaded_image_id = isExistUploadedPhoto
        ? uploadedViewFile.id
        : recentlyPhoto.id;

      if (
        typeof event.data.jwtToken === "string" &&
        event.data.jwtToken.length > 0
      ) {
        const operationResponse = await fetch(
          "https://web-sdk.aiuta.com/api/create-operation-id",
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              uploaded_image_id: uploaded_image_id,
              ...event.data,
            }),
          }
        );

        setEndpointData(event.data);

        if (operationResponse.ok) {
          const result = await operationResponse.json();

          dispatch(generateSlice.actions.setIsStartGeneration(true));

          if (isExistUploadedPhoto) {
            handlePutRecentlyPhotos(
              uploadedViewFile.id,
              uploadedViewFile.url,
              "tryon-recent-photos"
            );
          }

          if (result.operation_id) {
            generationApiCallInterval = setInterval(() => {
              handleGetGeneratedImage(result.operation_id);
              window.removeEventListener("message", handleGenerate);
            }, 3000);

            const analytic = {
              data: {
                type: "tryOn",
                event: "tryOnStarted",
                pageId: "tryOn",
                productIds: [endpointData?.skuId],
              },
              localDateTime: Date.now(),
            };

            window.parent.postMessage(
              { action: AnalyticEventsEnum.tryOn, analytic },
              "*"
            );
          }
        } else {
          dispatch(generateSlice.actions.setIsStartGeneration(false));
          dispatch(
            alertSlice.actions.setShowAlert({
              type: "error",
              isShow: true,
              buttonText: "Try again",
              content: "Something went wrong, please try again later.",
            })
          );
        }
      } else {
        dispatch(generateSlice.actions.setIsStartGeneration(false));
        dispatch(
          alertSlice.actions.setShowAlert({
            type: "error",
            isShow: true,
            buttonText: "Try again",
            content: "Something went wrong, please try again later.",
          })
        );
      }
    }
  };

  const handleTryOn = useCallback(async () => {
    if (!endpointData) return console.error("Endpoints info is missing");

    dispatch(alertSlice.actions.setShowAlert({ isShow: false }));
    dispatch(generateSlice.actions.setIsStartGeneration(true));

    console.log("PRODUCT ID FROM SDK : ", endpointData.skuId);

    if (endpointData.userId && endpointData.userId.length > 0) {
      const isExistUploadedPhoto = uploadedViewFile.id.length;
      const uploaded_image_id = isExistUploadedPhoto
        ? uploadedViewFile.id
        : recentlyPhoto.id;

      window.parent.postMessage(
        {
          action: "GET_AIUTA_JWT_TOKEN",
          uploaded_image_id: uploaded_image_id,
        },
        "*"
      );

      window.addEventListener("message", handleGenerate);
    } else {
      const isExistUploadedPhoto = uploadedViewFile.id.length;
      const uploaded_image_id = isExistUploadedPhoto
        ? uploadedViewFile.id
        : recentlyPhoto.id;

      const operationResponse = await fetch(
        "https://web-sdk.aiuta.com/api/create-operation-id",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            uploaded_image_id: uploaded_image_id,
            ...endpointData,
          }),
        }
      );

      if (operationResponse.ok) {
        const result = await operationResponse.json();

        if (isExistUploadedPhoto) {
          handlePutRecentlyPhotos(
            uploadedViewFile.id,
            uploadedViewFile.url,
            "tryon-recent-photos"
          );
        }

        if (result.operation_id) {
          generationApiCallInterval = setInterval(() => {
            handleGetGeneratedImage(result.operation_id);
          }, 3000);
        }
      } else {
        dispatch(generateSlice.actions.setIsStartGeneration(false));
        dispatch(
          alertSlice.actions.setShowAlert({
            type: "error",
            isShow: true,
            buttonText: "Try again",
            content: "Something went wrong, please try again later.",
          })
        );
      }
    }
  }, [endpointData]);

  const handleRegenerate = () => {
    dispatch(alertSlice.actions.setShowAlert({ isShow: false }));
    handleTryOn();
  };

  const handleCloseAbortedMidal = () => {
    setIsOpenAbortedModal(false);
  };

  const handleShowFullScreen = (activeImage: { id: string; url: string }) => {
    window.parent.postMessage(
      {
        action: "OPEN_AIUTA_FULL_SCREEN_MODAL",
        images: [],
        modalType: undefined,
        activeImage: activeImage,
      },
      "*"
    );
  };

  const handleGetWidnwInitiallySizes = () => {
    window.parent.postMessage({ action: "GET_AIUTA_API_KEYS" }, "*");
  };

  const isExistUploadedPhoto = uploadedViewFile.localUrl.length > 0;
  const isCheckRecentlyPhotos = recentlyPhotos && recentlyPhotos.length > 0;

  useEffect(() => {
    if (!isExistUploadedPhoto && isCheckRecentlyPhotos) {
      setRecentlyPhoto(recentlyPhotos[0]);
    }
  }, [recentlyPhotos, uploadedViewFile]);

  useEffect(() => {
    handleGetWidnwInitiallySizes();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        if (event.data.status === 200 && "userId" in event.data) {
          setEndpointData(event.data);
        }
      } else {
        console.error("Not found API data");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      handleGetWidnwInitiallySizes();
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className={stylesConfiguration.pages.viewPageClassName}>
      <AiutaModal isOpen={isOpenAbortedModal}>
        <div className={styles.abortedModal}>
          <p>We couldn't detect anyone in this photo</p>
          <SecondaryButton
            text="Change photo"
            onClick={handleCloseAbortedMidal}
            classNames={styles.abortedButton}
          />
        </div>
      </AiutaModal>
      <Alert onClick={handleRegenerate} />
      {isMobile ? (
        <ViewMobile />
      ) : (
        <Section>
          <motion.div
            key="view-page"
            className={styles.viewContainer}
            {...initiallAnimationConfig}
          >
            <div className={styles.viewContent}>
              {isExistUploadedPhoto ? (
                <ViewImage
                  url={uploadedViewFile.localUrl}
                  isStartGeneration={isStartGeneration}
                  generatedImageUrl={generatedImageUrl}
                  isShowChangeImageBtn={
                    isOpenAbortedModal
                      ? false
                      : isStartGeneration
                      ? false
                      : true
                  }
                  onClick={() =>
                    handleShowFullScreen({
                      id: uploadedViewFile.id,
                      url: uploadedViewFile.url,
                    })
                  }
                />
              ) : null}
              {recentlyPhoto.url.length ? (
                <ViewImage
                  url={recentlyPhoto.url}
                  isStartGeneration={isStartGeneration}
                  generatedImageUrl={generatedImageUrl}
                  isShowChangeImageBtn={
                    isOpenAbortedModal
                      ? false
                      : isStartGeneration
                      ? false
                      : true
                  }
                  onClick={() => handleShowFullScreen(recentlyPhoto)}
                />
              ) : null}
            </div>
            {!isStartGeneration && !isOpenAbortedModal && (
              <TryOnButton isShowTryOnIcon onClick={handleTryOn}>
                Try On
              </TryOnButton>
            )}
          </motion.div>
        </Section>
      )}
    </div>
  );
}
