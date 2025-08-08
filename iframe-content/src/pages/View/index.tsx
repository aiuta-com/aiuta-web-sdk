import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { motion, easeInOut } from "framer-motion";

// redux
import { useAppSelector, useAppDispatch } from "../../../lib/redux/store";

// actions
import { generateSlice } from "../../../lib/redux/slices/generateSlice";

// selectors
import {
  isMobileSelector,
  generationButtonConfigsSelector,
} from "@lib/redux/slices/configSlice/selectors";
import { uploadedViewFileSelector } from "@lib/redux/slices/fileSlice/selectors";
import { recentlyPhotosSelector } from "../../../lib/redux/slices/generateSlice/selectors";

// components
import ViewMobile from "./viewMobile";
import { Section, TryOnButton, ViewImage } from "@/components/feature";

// types
import { EndpointDataTypes } from "@/types";

// styles
import styles from "./view.module.scss";

let generationApiCallInterval: NodeJS.Timeout | null = null;

const initiallAnimationConfig = {
  initial: {
    opacity: 0,
    scale: 0,
    x: "0vw",
  },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    scale: 0,
    x: "0vw",
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
  const [isStartGeneration, setIsStartGeneration] = useState(false);
  const [recentlyPhoto, setRecentlyPhoto] = useState({ id: "", url: "" });
  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
  );

  const isMobile = useAppSelector(isMobileSelector);
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector);
  const uploadedViewFile = useAppSelector(uploadedViewFileSelector);
  const generationButtonConfigs = useAppSelector(
    generationButtonConfigsSelector
  );

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

    localStorage.setItem(storageKey, JSON.stringify(newPhotos));
  };

  const handleGetGeneratedImage = async (operation_id: string) => {
    try {
      const response = await fetch(`https://web-sdk.aiuta.com/api/sku-image-operation`, {
        method: "POST",
        body: JSON.stringify({ ...endpointData, operation_id: operation_id }),
      });

      if (!response.ok) return;

      const result = await response.json();
      console.log("result", result);

      if (result.status === "SUCCESS") {
        const { generated_images } = result;
        const { id, url } = generated_images[0];

        setGeneratedImageUrl(url);
        handleNavigate("generated");

        setTimeout(() => {
          setIsStartGeneration(false);
        }, 500);

        dispatch(generateSlice.actions.setGeneratedImage({ id, url }));

        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval);
          generationApiCallInterval = null;
        }
      }
    } catch (err) {
      console.error("Generation image Error:", err);
    }
  };

  const handleTryOn = async () => {
    if (!endpointData) return console.error("Endpoints info is missing");

    const isExistUploadedPhoto = uploadedViewFile.id.length;
    const uploaded_image_id = isExistUploadedPhoto
      ? uploadedViewFile.id
      : recentlyPhoto.id;

    const operationResponse = await fetch("https://web-sdk.aiuta.com/api/create-operation-id", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        uploaded_image_id: uploaded_image_id,
        ...endpointData,
      }),
    });

    if (operationResponse.ok) {
      const result = await operationResponse.json();

      setIsStartGeneration(true);

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
    }
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
        if (event.data.status === 200) {
          setEndpointData(event.data);
        } else {
          console.error(
            "Something went wrong. Please check the sdk file"
          );
        }
      } else {
        console.error("Not found API data");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
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
                  isShowChangeImageBtn={isStartGeneration ? false : true}
                />
              ) : null}
              {recentlyPhoto.url.length ? (
                <ViewImage
                  url={recentlyPhoto.url}
                  isStartGeneration={isStartGeneration}
                  generatedImageUrl={generatedImageUrl}
                  isShowChangeImageBtn={isStartGeneration ? false : true}
                />
              ) : null}
            </div>
            <TryOnButton
              isShowTryOnIcon
              onClick={handleTryOn}
              dynamicStyles={generationButtonConfigs}
            >
              Try On
            </TryOnButton>
          </motion.div>
        </Section>
      )}
    </>
  );
}
