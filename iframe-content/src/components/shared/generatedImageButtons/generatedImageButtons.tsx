import React from "react";

// redux
import { useAppSelector } from "@lib/redux/store";

// selectors
import {
  aiutaEndpointDataSelector,
  stylesConfigurationSelector,
} from "@lib/redux/slices/configSlice/selectors";

// components
import { SecondaryButton } from "@/components/feature";

// types
import { AnalyticEventsEnum } from "@/types";
import { GeneratedImageButtonsTypes } from "./types";

// styles
import styles from "./generatedImageButtons.module.scss";

export const GeneratedImageButtons = (props: GeneratedImageButtonsTypes) => {
  const { activeGeneratedImageUrl } = props;

  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector);
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  const handleShare = async () => {
    window.parent.postMessage(
      { action: "open_share_modal", imageUrl: activeGeneratedImageUrl },
      "*"
    );

    const analytic = {
      data: {
        type: "share",
        event: "initiated",
        pageId: "results",
        productIds: [aiutaEndpointData.skuId],
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

    const analytic = {
      data: {
        type: "share",
        event: "donwloaded",
        pageId: "results",
        productIds: [aiutaEndpointData.skuId],
      },
      localDateTime: Date.now(),
    };

    window.parent.postMessage(
      { action: AnalyticEventsEnum.share, analytic },
      "*"
    );
  };

  return (
    <div
      className={`${styles.generatedImageButtons} ${stylesConfiguration.components.resultButonsContentClassName}`}
    >
      <SecondaryButton text="Share" onClick={handleShare} />
      <SecondaryButton text="Download" onClick={handleDownload} />
    </div>
  );
};
