import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
import { motion, easeInOut } from "framer-motion";
import { useNavigate } from "react-router-dom";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { fileSlice } from "@lib/redux/slices/fileSlice";
import { configSlice } from "@lib/redux/slices/configSlice";
import { generateSlice } from "@lib/redux/slices/generateSlice";

// selectors
import {
  qrTokenSelector,
  aiutaEndpointDataSelector,
  stylesConfigurationSelector,
  isSelectPreviouselyImagesSelector,
} from "@lib/redux/slices/configSlice/selectors";
import { recentlyPhotosSelector } from "@lib/redux/slices/generateSlice/selectors";

// helpers
import { generateRandomString } from "@/helpers/generateRandomString";

// components
import {
  QrCode,
  Section,
  TryOnButton,
  SelectableImage,
} from "@/components/feature";

// types
import { AnalyticEventsEnum, EndpointDataTypes } from "@/types";

// styles
import styles from "./previously.module.scss";

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

export default function Previously() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const qrToken = useAppSelector(qrTokenSelector);
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector);
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector);
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);
  const isSelectPreviouselyImages = useAppSelector(
    isSelectPreviouselyImagesSelector
  );

  const qrApiInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
  );

  const handleNavigate = (path: string) => {
    if (!recentlyPhotos.length) return;
    navigate(`/${path}`);
  };

  const handleChnagePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!endpointData) return;
    dispatch(configSlice.actions.setIsShowSpinner(true));

    if (event.target && event.target.files) {
      const file = event.target.files[0];

      if (!file) return dispatch(configSlice.actions.setIsShowSpinner(false));

      const hasUserId =
        typeof endpointData.userId === "string" &&
        endpointData.userId.length > 0;
      let headers: any = { "Content-Type": file.type, "X-Filename": file.name };

      if (hasUserId) {
        headers["userid"] = endpointData.userId;
      } else {
        headers["keys"] = endpointData.apiKey;
      }

      try {
        const uploadedResponse = await fetch(
          "https://web-sdk.aiuta.com/api/upload-image",
          {
            method: "POST",
            headers: headers,
            body: file,
          }
        );

        if (uploadedResponse.ok) {
          const result = await uploadedResponse.json();

          if (result.owner_type === "user") {
            dispatch(
              fileSlice.actions.setUploadViewFile({ file: file, ...result })
            );
          }
        }

        navigate("/view");
      } catch (error) {
        console.error("Upload image Error: ", error);
      } finally {
        dispatch(configSlice.actions.setIsShowSpinner(false));
      }
    }
  };

  const handleChooseNewPhoto = (id: string, url: string) => {
    if (isSelectPreviouselyImages) {
      dispatch(fileSlice.actions.setUploadViewFile({ id, url }));
      handleNavigate("view");

      const analytic = {
        data: {
          type: "picker",
          pageId: "pickerEvent",
          event: "uploadedPhotoSelected",
          productIds: [aiutaEndpointData?.skuId],
        },
      };

      window.parent.postMessage(
        { action: AnalyticEventsEnum.uploadedPhotoSelected, analytic },
        "*"
      );
    } else {
      handleShowFullScreen({ id, url });
    }

    dispatch(configSlice.actions.setIsSelectPreviouselyImages(false));
  };

  const handleRemovePhoto = (imageId: string) => {
    const removedPhoto = recentlyPhotos.filter(({ id }) => id !== imageId);

    dispatch(generateSlice.actions.setRecentlyPhotos(removedPhoto));

    const analytic = {
      data: {
        type: "picker",
        pageId: "imagePicker",
        event: "uploadedPhotoDeleted",
        productIds: [aiutaEndpointData?.skuId],
      },
    };

    window.parent.postMessage(
      { action: AnalyticEventsEnum.uploadedPhotoDeleted, analytic },
      "*"
    );
  };

  const handleGetWidnwInitiallySizes = () => {
    window.parent.postMessage({ action: "GET_AIUTA_API_KEYS" }, "*");
  };

  const handleShowFullScreen = (activeImage: { id: string; url: string }) => {
    window.parent.postMessage(
      {
        action: "OPEN_AIUTA_FULL_SCREEN_MODAL",
        images: recentlyPhotos,
        modalType: "previously",
        activeImage: activeImage,
      },
      "*"
    );
  };

  const handleCheckQRUploadedPhoto = useCallback(async () => {
    const getUploadedPhoto = await fetch(
      `https://web-sdk.aiuta.com/api/get-photo?token=${qrToken}`
    );
    const result = await getUploadedPhoto.json();

    if (result.owner_type === "scanning") {
      dispatch(configSlice.actions.setIsShowQrSpinner(true));
    } else if (result.owner_type === "user") {
      dispatch(configSlice.actions.setIsShowQrSpinner(false));
      dispatch(fileSlice.actions.setUploadViewFile({ ...result }));

      const deleteQrToken = await fetch(
        `https://web-sdk.aiuta.com/api/delete-qr-token?token=${qrToken}`
      );
      await deleteQrToken.json();

      navigate("/view");
    }
  }, [qrToken, dispatch, navigate]);

  const handleAnalytic = () => {
    if (aiutaEndpointData.skuId && aiutaEndpointData.skuId.length > 0) {
      const analytic = {
        data: {
          type: "picker",
          pageId: "imagePicker",
          event: "uploadsHistoryOpened",
          productIds: [aiutaEndpointData?.skuId],
        },
      };

      window.parent.postMessage(
        { action: AnalyticEventsEnum.uploadsHistoryOpened, analytic },
        "*"
      );
    }
  };

  useEffect(() => {
    handleAnalytic();
  }, []);

  useEffect(() => {
    if (!recentlyPhotos.length) {
      dispatch(configSlice.actions.setQrToken(generateRandomString()));
    }
  }, [recentlyPhotos, dispatch]);

  useEffect(() => {
    if (!recentlyPhotos.length) {
      //TO DO may used in future
      // qrApiInterval.current = setInterval(() => {
      //   handleCheckQRUploadedPhoto();
      // }, 3000);
      navigate("/qr");
    }

    //TO DO may used in future
    // return () => {
    //   if (qrApiInterval.current) {
    //     clearInterval(qrApiInterval.current);
    //   }
    // };
    // }, [qrApiInterval, recentlyPhotos, handleCheckQRUploadedPhoto]);
  }, [recentlyPhotos]);

  useEffect(() => {
    handleGetWidnwInitiallySizes();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        if (event.data.status === 200) {
          setEndpointData(event.data);
        }

        if (event.data.type === "REMOVE_PREVIOUSELY_IMAGES") {
          handleRemovePhoto(event.data.images.id);
          dispatch(generateSlice.actions.setRecentlyPhotos(event.data.images));
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

  const hasUserId =
    endpointData &&
    typeof endpointData.userId === "string" &&
    endpointData.userId.length > 0;
  const qrUrl = endpointData
    ? `https://static.aiuta.com/sdk/v0/index.html#/qr/${qrToken}?${
        hasUserId
          ? `userId=${endpointData.userId}`
          : `apiKey=${endpointData.apiKey}`
      }`
    : "not-found";

  return (
    <>
      <Section
        className={`${styles.sectionContent} ${stylesConfiguration.pages.previouselyPageClassName}`}
      >
        <motion.div
          key="previously-page"
          className={styles.viewContent}
          {...initiallAnimationConfig}
        >
          {recentlyPhotos.length > 0 ? (
            <div className={styles.imageContent}>
              {recentlyPhotos.map(({ id, url }) => (
                <SelectableImage
                  key={id}
                  src={url}
                  imageId={id}
                  variant="previously"
                  onClick={() => handleChooseNewPhoto(id, url)}
                  onDelete={handleRemovePhoto}
                />
              ))}
            </div>
          ) : //TO DO may used in future
          // <div className={styles.qrContent}>
          //   {endpointData ? (
          //     <QrCode onChange={() => {}} isShowQrInfo={false} url={qrUrl} />
          //   ) : null}
          // </div>
          null}

          <TryOnButton onClick={() => handleNavigate("qr")}>
            <>
              + Upload new photo
              {!recentlyPhotos.length && (
                <label className={styles.changeImageBtn}>
                  <input type="file" onChange={handleChnagePhoto} />
                </label>
              )}
            </>
          </TryOnButton>
        </motion.div>
      </Section>
    </>
  );
}
