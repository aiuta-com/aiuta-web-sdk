import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// redux
import { useAppSelector, useAppDispatch } from "../../../lib/redux/store";

// actions
import { fileSlice } from "@lib/redux/slices/fileSlice";
import { configSlice } from "@lib/redux/slices/configSlice";

// selectors
import {
  qrTokenSelector,
  aiutaEndpointDataSelector,
  stylesConfigurationSelector,
} from "@lib/redux/slices/configSlice/selectors";

// components
import { QrCode } from "@/components/feature";

// types
import { AnalyticEventsEnum, EndpointDataTypes } from "@/types";

// helpers
import { generateRandomString } from "@/helpers/generateRandomString";

// styles
import styles from "./token.module.scss";

let initiallAnalyticCompleted = false;

export default function Qr() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const qrToken = useAppSelector(qrTokenSelector);
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector);
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  const qrApiInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
  );

  const handleAnalytic = () => {
    if (initiallAnalyticCompleted) return;
    initiallAnalyticCompleted = true;

    const analytic = {
      data: {
        type: "page",
        event: "pickerEvent",
        pageId: "imagePicker",
        productIds: [aiutaEndpointData.skuId],
      },
      localDateTime: Date.now(),
    };

    window.parent.postMessage(
      { action: AnalyticEventsEnum.newPhotoTaken, analytic },
      "*"
    );
  };

  useEffect(() => {
    handleAnalytic();
    // eslint-disable-next-line
  }, []);

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!endpointData) return;

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
        dispatch(configSlice.actions.setIsShowFooter(false));
        navigate("/view");

        const analytic = {
          data: {
            type: "tryOn",
            event: "photoUploaded",
            pageId: "imagePicker",
            productIds: [aiutaEndpointData.skuId],
          },
          localDateTime: Date.now(),
        };

        window.parent.postMessage(
          { action: AnalyticEventsEnum.newPhotoTaken, analytic },
          "*"
        );
      }
    }
  };

  const handleGetWidnwInitiallySizes = () => {
    window.parent.postMessage({ action: "GET_AIUTA_API_KEYS" }, "*");
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

      const analytic = {
        data: {
          type: "tryOn",
          event: "photoUploaded",
          pageId: "imagePicker",
          productIds: [aiutaEndpointData.skuId],
        },
        localDateTime: Date.now(),
      };

      window.parent.postMessage(
        { action: AnalyticEventsEnum.newPhotoTaken, analytic },
        "*"
      );

      const deleteQrToken = await fetch(
        `https://web-sdk.aiuta.com/api/delete-qr-token?token=${qrToken}`
      );
      await deleteQrToken.json();

      navigate("/view");
    }
  }, [qrToken, dispatch, navigate]);

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

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    dispatch(configSlice.actions.setQrToken(generateRandomString()));
  }, [dispatch]);

  useEffect(() => {
    qrApiInterval.current = setInterval(() => {
      handleCheckQRUploadedPhoto();
    }, 3000);

    return () => {
      if (qrApiInterval.current) {
        clearInterval(qrApiInterval.current);
      }
    };
  }, [qrApiInterval, handleCheckQRUploadedPhoto]);

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
      <motion.div
        className={`${styles.qrContainer} ${stylesConfiguration.pages.qrPageClassName}`}
        key="qr-page"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {endpointData ? (
          <QrCode onChange={handleChoosePhoto} url={qrUrl} />
        ) : null}
      </motion.div>
    </>
  );
}
