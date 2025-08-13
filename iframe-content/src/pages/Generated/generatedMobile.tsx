import React, { MouseEvent } from "react";

// redux
import { useAppSelector, useAppDispatch } from "../../../lib/redux/store";

// actions
import { fileSlice } from "@lib/redux/slices/fileSlice";

// selectors
import { generatedImagesSelector } from "@lib/redux/slices/generateSlice/selectors";

// components
import { ViewImage } from "@/components/feature";

// styles
import styles from "./generated.module.scss";

export default function GeneratedMobile() {
  const dispatch = useAppDispatch();

  const generatedImages = useAppSelector(generatedImagesSelector);

  const handleShare = async () => {
    const imageUrl = generatedImages[0]?.url;

    window.parent.postMessage(
      {
        action: "SHARE_IMAGE",
        payload: {
          url: imageUrl,
          title: "",
          text: "",
        },
      },
      "*"
    );
  };

  const handleFullScreenImage = (event: MouseEvent<HTMLImageElement>) => {
    const target = event.target as HTMLElement;

    if (target instanceof HTMLImageElement) {
      dispatch(fileSlice.actions.setFullScreenImageUrl(target.src));
    }
  };

  return (
    <>
      <div className={styles.generatedImagesScrollableViewMobile}>
        {generatedImages ? (
          <div className={styles.viewContent}>
            <ViewImage
              imgUnoptimazed={true}
              isStartGeneration={false}
              className={styles.viewItem}
              url={generatedImages[0].url}
              isShowChangeImageBtn={false}
              onClick={handleFullScreenImage}
            />
            <div className={styles.shareBox} onClick={handleShare}>
              <img
                src={"./icons/shareMobile.svg"}
                alt="Share icon"
                className={styles.shareIcon}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
