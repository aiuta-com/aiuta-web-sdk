import React, { useRef, useState, ChangeEvent, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";

import { TryOnButton, ViewImage } from "@/components/feature";

import styles from "./token.module.scss";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function QRTokenPage() {
  // get `token` from route param and `apiKey` from query string
  const { token } = useParams<{ token: string }>();
  const query = useQuery();
  const apiKey = query.get("apiKey") || "";

  const [generationData, setGenerationData] = useState<{
    isStart: boolean;
    uploadedUrl: string | null;
  }>({
    isStart: false,
    uploadedUrl: null,
  });

  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    file: File;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadPhoto = async () => {
    if (!uploadedFile) return;

    try {
      setGenerationData({ isStart: true, uploadedUrl: null });
      const file = uploadedFile.file;

      const uploadedResponse = await fetch("https://web-sdk.aiuta.com/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          "X-Filename": file.name,
          keys: apiKey,
        },
        body: file,
      });

      const result = await uploadedResponse.json();

      await fetch("https://web-sdk.aiuta.com/api/upload-qr-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          ...result,
        }),
      });

      setTimeout(() => {
        setGenerationData({ isStart: false, uploadedUrl: result.url });
      }, 3000);
    } catch (error) {
      console.error("Upload selected image Error: ", error);
    } finally {
      setTimeout(() => {
        setGenerationData((prevState) => {
          return { isStart: false, uploadedUrl: prevState.uploadedUrl };
        });
      }, 5000);
    }
  };

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.files) {
      const file = event.target.files[0];
      const objectUrl = URL.createObjectURL(file);

      setUploadedFile({
        file,
        url: objectUrl,
      });
    }
  };

  const handleMakeScannedStatus = useCallback(async () => {
    if (!token) return;
    await fetch("https://web-sdk.aiuta.com/api/upload-qr-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "",
        url: "",
        token: token,
        type: "scanning",
      }),
    });
  }, [token]);

  useEffect(() => {
    handleMakeScannedStatus();
  }, [handleMakeScannedStatus]);

  return (
    <div className={styles.tokenContainer}>
      {uploadedFile && !generationData.uploadedUrl ? (
        <div className={styles.uploadedContent}>
          <div className={styles.uploadedBox}>
            <ViewImage
              imgUnoptimazed={true}
              url={uploadedFile.url}
              className={styles.viewItem}
              isStartGeneration={generationData.isStart}
              isShowChangeImageBtn={!generationData.isStart}
              onChange={handleButtonClick}
            />
          </div>
          <TryOnButton onClick={handleUploadPhoto}>Next</TryOnButton>
        </div>
      ) : !generationData.uploadedUrl ? (
        <div className={styles.banner}>
          <img src={'/icons/tokenBannerGirl.svg'} alt="Girl icon" />
          <div className={styles.uploadBtnContent}>
            <TryOnButton onClick={handleButtonClick}>Upload a photo of you</TryOnButton>
          </div>
        </div>
      ) : (
        <div className={styles.resultContent}>
          <div className={styles.resultImageBox}>
            <img src={'/icons/success.svg'} alt="Success icon" className={styles.successIcon} />
            <img
              width={160}
              height={245}
              alt="Uploaded photo"
              className={styles.resultImg}
              src={generationData.uploadedUrl}
            />
          </div>
          <div className={styles.infoContent}>
            <h3>Your photo has been uploaded</h3>
            <h4>It will appear within a few seconds</h4>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChoosePhoto}
        style={{ display: "none" }}
      />
    </div>
  );
}
