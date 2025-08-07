import Head from "next/head";
import { useRef, useState, useEffect, useCallback, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { fileSlice } from "@lib/redux/slices/fileSlice";
import { configSlice } from "@lib/redux/slices/configSlice";
import { generateSlice } from "@lib/redux/slices/generateSlice";

// selectors
import { qrTokenSelector } from "@lib/redux/slices/configSlice/selectors";
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
import { EndpointDataTypes } from "@/types";

// styles
import styles from "./previously.module.scss";

const initiallAnimationConfig = {
  initial: {
    x: "100%",
  },
  animate: {
    x: 0,
  },
  exit: {
    x: "100%",
  },
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

export default function Previously() {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const qrToken = useAppSelector(qrTokenSelector);
  const recentlyPhotos = useAppSelector(recentlyPhotosSelector);

  const qrApiInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
  );

  const handleNavigate = (path: string) => {
    if (!recentlyPhotos.length) return;

    router.push(`/${path}`);
  };

  const handleChnagePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!endpointData) return;
    dispatch(configSlice.actions.setIsShowSpinner(true));

    if (event.target && event.target.files) {
      const file = event.target.files[0];

      if (!file) return dispatch(configSlice.actions.setIsShowSpinner(false));

      try {
        const uploadedResponse = await fetch("/api/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "X-Filename": file.name,
            keys: endpointData.apiKey,
          },
          body: file,
        });

        if (uploadedResponse.ok) {
          const result = await uploadedResponse.json();

          if (result.owner_type === "user") {
            dispatch(
              fileSlice.actions.setUploadViewFile({ file: file, ...result })
            );
          }
        }

        router.push("/view");
      } catch (error) {
        console.error("Upload image Error: ", error);
      } finally {
        dispatch(configSlice.actions.setIsShowSpinner(false));
      }
    }
  };

  const handleChooseNewPhoto = (id: string, url: string) => {
    dispatch(fileSlice.actions.setUploadViewFile({ id, url }));
    handleNavigate("view");
  };

  const handleRemovePhoto = (imageId: string) => {
    const removedPhoto = recentlyPhotos.filter(({ id }) => id !== imageId);

    dispatch(generateSlice.actions.setRecentlyPhotos(removedPhoto));
  };

  const handleGetWidnwInitiallySizes = () => {
    window.parent.postMessage({ action: "GET_AIUTA_API_KEYS" }, "*");
  };

  const handleCheckQRUploadedPhoto = useCallback(async () => {
    const getUploadedPhoto = await fetch(`/api/get-photo?token=${qrToken}`);
    const result = await getUploadedPhoto.json();

    if (result.owner_type === "scanning") {
      dispatch(configSlice.actions.setIsShowQrSpinner(true));
    } else if (result.owner_type === "user") {
      dispatch(configSlice.actions.setIsShowQrSpinner(false));
      dispatch(fileSlice.actions.setUploadViewFile({ ...result }));

      const deleteQrToken = await fetch(
        `/api/delete-qr-token?token=${qrToken}`
      );
      await deleteQrToken.json();

      router.push("/view");
    }
    // eslint-disable-next-line
  }, [qrToken]);

  useEffect(() => {
    if (!recentlyPhotos.length) {
      dispatch(configSlice.actions.setQrToken(generateRandomString()));
    }
  }, [recentlyPhotos, dispatch]);

  useEffect(() => {
    if (!recentlyPhotos.length) {
      qrApiInterval.current = setInterval(() => {
        handleCheckQRUploadedPhoto();
      }, 3000);
    }

    return () => {
      if (qrApiInterval.current) {
        clearInterval(qrApiInterval.current);
      }
    };
  }, [qrApiInterval, recentlyPhotos, handleCheckQRUploadedPhoto]);

  useEffect(() => {
    handleGetWidnwInitiallySizes();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        if (event.data.status === 200) {
          setEndpointData(event.data);
        } else {
          console.error(
            "Something is went to wrong. Please check the sdk file"
          );
        }
      } else {
        console.error("Not found API data");
      }
    };

    window.addEventListener("message", handleMessage);
  }, []);

  return (
    <>
      <Head>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section className={styles.sectionContent}>
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
          ) : (
            <div className={styles.qrContent}>
              {endpointData ? (
                <QrCode
                  onChange={() => {}}
                  isShowQrInfo={false}
                  url={`https://web-sdk.aiuta.com/qr/${qrToken}?apiKey=${endpointData.apiKey}`}
                />
              ) : null}
            </div>
          )}

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
