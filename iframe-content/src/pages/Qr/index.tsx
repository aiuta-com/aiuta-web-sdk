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
import { qrTokenSelector } from "@lib/redux/slices/configSlice/selectors";

// components
import { QrCode } from "@/components/feature";

// types
import { EndpointDataTypes } from "@/types";

// helpers
import { generateRandomString } from "@/helpers/generateRandomString";

// styles
import styles from "./token.module.scss";

export default function Qr() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const qrToken = useAppSelector(qrTokenSelector);

  const qrApiInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
  );

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!endpointData) return;

    if (event.target && event.target.files) {
      const file = event.target.files[0];

      if (!file) return dispatch(configSlice.actions.setIsShowSpinner(false));

      const uploadedResponse = await fetch(
        "https://web-sdk.aiuta.com/api/upload-image",
        {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "X-Filename": file.name,
            keys: endpointData.apiKey,
          },
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
        } else {
          console.error("Something went wrong. Please check the SDK file");
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

  return (
    <>
      <motion.div
        className={styles.qrContainer}
        key="qr-page"
        initial={{
          opacity: 0,
          scale: 0,
          x: "0vw",
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0,
          x: "0vw",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {endpointData ? (
          <QrCode
            onChange={handleChoosePhoto}
            url={`https://static.aiuta.com/sdk/v0/index.html#/qr/${qrToken}`}
          />
        ) : null}
      </motion.div>
    </>
  );
}
