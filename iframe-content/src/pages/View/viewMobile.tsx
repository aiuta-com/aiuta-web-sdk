import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { motion, easeInOut } from "framer-motion";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { fileSlice } from "@lib/redux/slices/fileSlice";
import { configSlice } from "@lib/redux/slices/configSlice";
import { generateSlice } from "@lib/redux/slices/generateSlice";

// selectors
import {
  isOpenSwipSelector,
  isShowFooterSelector,
  stylesConfigurationSelector,
} from "@lib/redux/slices/configSlice/selectors";
import { uploadedViewFileSelector } from "@lib/redux/slices/fileSlice/selectors";
import { recentlyPhotosSelector } from "@lib/redux/slices/generateSlice/selectors";

// components
import {
  Swip,
  Section,
  ViewImage,
  TryOnButton,
  SelectableImage,
} from "@/components/feature";
import { EmptyViewImage } from "@/components/shared";

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

export default function ViewMobile() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isStartGeneration, setIsStartGeneration] = useState(false);
  const [recentlyPhoto, setRecentlyPhoto] = useState({ id: "", url: "" });
  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
);

  const isOpenSwip = useAppSelector(isOpenSwipSelector);
  const isShowFooter = useAppSelector(isShowFooterSelector);
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector);
  const uploadedViewFile = useAppSelector(uploadedViewFileSelector);
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
        setIsStartGeneration(false);
        handleNavigate("generated");

        dispatch(generateSlice.actions.setGeneratedImage({ id, url }));

        if (generationApiCallInterval) {
          clearInterval(generationApiCallInterval);
          generationApiCallInterval = null;
          dispatch(fileSlice.actions.setUploadViewFile(null));
        }
      }
    } catch (err) {
      console.error("Generation image Error:", err);
    }
  };

  const handleGenerates = async (event: any) => {
    if (event.data.status === 200 && event.data.type === "baseKeys") {
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
            ...event.data,
          }),
        }
      );

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
            window.removeEventListener("message", handleGenerates);
          }, 3000);
        }
      }
    }
  };

  const handleTryOn = async () => {
    if (!endpointData) return console.error("Endpoints info is missing");

    const isExistUploadedPhoto = uploadedViewFile.id.length;
    const uploaded_image_id = isExistUploadedPhoto
      ? uploadedViewFile.id
      : recentlyPhoto.id;

    if (endpointData.userId && endpointData.userId.length > 0) {
      window.parent.postMessage({ action: "GET_AIUTA_JWT_TOKEN" }, "*");

      window.addEventListener("message", handleGenerates);
    } else {
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

          const analytic = {
            data: {
              type: "tryOn",
              event: "tryOnStarted",
              pageId: "tryOn",
              productIds: [endpointData.skuId],
            },
            localDateTime: Date.now(),
          };

          window.parent.postMessage(
            { action: AnalyticEventsEnum.tryOn, analytic },
            "*"
          );
        }
      }
    }
  };

  const handleGenerate = async (uploadedData: { id: string; url: string }) => {
    const isExistUploadedPhoto = uploadedData.id.length;

    const operationResponse = await fetch(
      "https://web-sdk.aiuta.com/api/create-operation-id",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          uploaded_image_id: uploadedData.id,
          ...endpointData,
        }),
      }
    );

    if (operationResponse.ok) {
      const result = await operationResponse.json();

      if (isExistUploadedPhoto) {
        handlePutRecentlyPhotos(
          uploadedData.id,
          uploadedData.url,
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

  const handleOpenSwip = () => {
    dispatch(configSlice.actions.setIsOpenSwip(true));
  };

  const handleRemovePhoto = (imageId: string) => {
    const removedPhoto = recentlyPhotos.filter(({ id }) => id !== imageId);

    dispatch(generateSlice.actions.setRecentlyPhotos(removedPhoto));
  };

  const handleChooseNewPhoto = (id: string, url: string) => {
    setTimeout(() => {
      handleGenerate({ id, url });
      setIsStartGeneration(true);
      dispatch(fileSlice.actions.setUploadViewFile({ id, url }));
    }, 300);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!endpointData) return;

    if (event.target && event.target.files) {
      const file = event.target.files[0];

      if (!file) return dispatch(configSlice.actions.setIsShowSpinner(false));

      setTimeout(() => {
        setIsStartGeneration(true);
      }, 500);
      dispatch(configSlice.actions.setIsShowFooter(true));

      const hasUserId =
        typeof endpointData.userId === "string" &&
        endpointData.userId.length > 0;
      let headers: any = { "Content-Type": file.type, "X-Filename": file.name };

      if (hasUserId) {
        headers["userid"] = endpointData.userId;
      } else {
        headers["keys"] = endpointData.apiKey;
      }

      const uploadedResponse = await fetch(
        "https://web-sdk.aiuta.com/api/upload-image",
        {
          method: "POST",
          headers: headers,
          body: file,
        }
      );
      const result = await uploadedResponse.json();

      if (result.owner_type === "user") {
        dispatch(
          fileSlice.actions.setUploadViewFile({ file: file, ...result })
        );
        handleGenerate(result);

        if (isOpenSwip) dispatch(configSlice.actions.setIsOpenSwip(false));
      }
    }
  };

  const handleGetWidnwInitiallySizes = () => {
    window.parent.postMessage({ action: "GET_AIUTA_API_KEYS" }, "*");
  };

  useEffect(() => {
    handleGetWidnwInitiallySizes();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        if (event.data.status === 200) {
          setEndpointData(event.data);
        }
      } else {
        console.error("Not found API data");
      }
    };

    window.addEventListener("message", handleMessage);
  }, []);

  const isExistUploadedPhoto = uploadedViewFile.localUrl.length > 0;
  const isCheckRecentlyPhotos = recentlyPhotos && recentlyPhotos.length > 0;

  useEffect(() => {
    if (!isExistUploadedPhoto && isCheckRecentlyPhotos) {
      setRecentlyPhoto(recentlyPhotos[0]);
      dispatch(configSlice.actions.setIsShowFooter(true));
    }
  }, [recentlyPhotos, uploadedViewFile]);

  return (
    <>
      {/* Remove or move head elements to index.html or use react-helmet */}
      <Section
        className={`${styles.sectionMobile} ${
          !isShowFooter ? styles.sectionMobileActive : ""
        } ${stylesConfiguration.pages.viewPageClassName}`}
      >
        <motion.div
          key="view-page"
          className={styles.viewContainerMobile}
          {...initiallAnimationConfig}
        >
          <div />
          <div className={styles.viewContentMobile}>
            {isExistUploadedPhoto ? (
              <ViewImage
                onChange={handleButtonClick}
                url={uploadedViewFile.localUrl}
                isStartGeneration={isStartGeneration}
                generatedImageUrl={generatedImageUrl}
                isShowChangeImageBtn={isStartGeneration ? false : true}
              />
            ) : !recentlyPhoto.url.length ? (
              <EmptyViewImage onClick={handleButtonClick} />
            ) : null}
            {recentlyPhoto.url.length ? (
              <ViewImage
                url={recentlyPhoto.url}
                onChange={handleOpenSwip}
                isStartGeneration={isStartGeneration}
                generatedImageUrl={generatedImageUrl}
                isShowChangeImageBtn={isStartGeneration ? false : true}
              />
            ) : null}
          </div>
          {recentlyPhoto.url.length && !isStartGeneration ? (
            <TryOnButton isShowTryOnIcon onClick={handleTryOn}>
              Try On
            </TryOnButton>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChoosePhoto}
            style={{ display: "none" }}
          />
          <Swip
            onClickButton={handleButtonClick}
            buttonText="+ Upload new photo"
          >
            <div className={styles.imageContent}>
              {recentlyPhotos.length > 0
                ? recentlyPhotos.map((item, index) => (
                    <SelectableImage
                      key={index}
                      src={item.url}
                      imageId={item.id}
                      variant="previously"
                      isShowTrashIcon={true}
                      classNames={styles.previouslyImageBox}
                      onDelete={handleRemovePhoto}
                      onClick={() => handleChooseNewPhoto(item.id, item.url)}
                    />
                  ))
                : null}
            </div>
          </Swip>
        </motion.div>
      </Section>
    </>
  );
}
