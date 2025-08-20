import React from "react";
// components
import { SecondaryButton } from "@/components/feature";

// types
import { AnalyticEventsEnum } from "@/types";
import { GeneratedImageButtonsTypes } from "./types";

// styles
import styles from "./generatedImageButtons.module.scss";

export const GeneratedImageButtons = (props: GeneratedImageButtonsTypes) => {
  const { activeGeneratedImageUrl } = props;

  const handleShare = async () => {
    window.parent.postMessage(
      { action: "open_share_modal", imageUrl: activeGeneratedImageUrl },
      "*"
    );

    const analytic = {
      data: {
        type: "share",
        event: "shareEvent",
        pageId: "share",
      },
      localDateTime: Date.now(),
    };

    window.parent.postMessage(
      { action: AnalyticEventsEnum.share, analytic },
      "*"
    );
  };

  const handleDownload = async () => {
    if (activeGeneratedImageUrl) {
      const response = await fetch(activeGeneratedImageUrl, { mode: "cors" });
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `try-on-${Date.now()}`;
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }
  };

  return (
    <div className={styles.generatedImageButtons}>
      <SecondaryButton text="Share" onClick={handleShare} />
      <SecondaryButton text="Download" onClick={handleDownload} />
    </div>
  );
};
