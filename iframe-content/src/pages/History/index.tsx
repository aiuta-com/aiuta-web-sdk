import React, { useCallback, useEffect } from "react";
import { motion, easeInOut } from "framer-motion";

// redux
import { useAppSelector, useAppDispatch } from "../../../lib/redux/store";

// actions
import { fileSlice } from "@lib/redux/slices/fileSlice";
import { modalSlice } from "@lib/redux/slices/modalSlice";
import { generateSlice } from "@lib/redux/slices/generateSlice";

// selectors
import {
  selectedImagesSelector,
  generatedImagesSelector,
} from "@lib/redux/slices/generateSlice/selectors";
import {
  isMobileSelector,
  isSelectHistoryImagesSelector,
} from "@lib/redux/slices/configSlice/selectors";

// components
import { Section } from "@/components/feature";
import { SelectableImage } from "@/components/feature";
import { RemoveHistoryBanner } from "@/components/shared";

// components modal
import { HistoryImagesRemoveModal } from "@/components/shared/modals";

// types
import { AnalyticEventsEnum } from "@/types";

// styles
import styles from "./history.module.scss";

const initiallAnimationConfig = {
  initial: {
    x: "150%",
  },
  animate: {
    x: 0,
  },
  exit: {
    x: "150%",
  },
  transition: {
    duration: 0.3,
    ease: easeInOut,
  },
};

export default function History() {
  const dispatch = useAppDispatch();

  const isMobile = useAppSelector(isMobileSelector);
  const selectedImages = useAppSelector(selectedImagesSelector);
  const generatedImages = useAppSelector(generatedImagesSelector);
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector);

  const handleSelectImage = (id: string, url: string) => {
    if (!isMobile) {
      dispatch(generateSlice.actions.setSelectedImage(id));
    } else {
      if (isSelectHistoryImages) {
        dispatch(generateSlice.actions.setSelectedImage(id));
      } else {
        dispatch(fileSlice.actions.setFullScreenImageUrl(url));
      }
    }
  };

  const handleCloseHistoryImagesModal = () => {
    dispatch(modalSlice.actions.setShowHistoryImagesModal(false));
  };

  const handleDeleteSelectedImages = () => {
    const deletedHistoryImages = generatedImages.filter(
      ({ id }) => !selectedImages.includes(id)
    );

    dispatch(generateSlice.actions.setSelectedImage([])); // Use for close history banner
    dispatch(generateSlice.actions.setGeneratedImage(deletedHistoryImages));

    handleCloseHistoryImagesModal(); // Use for close history images model

    const analytic = {
      data: {
        type: "generatedImageDeleted",
        event: "generatedImageDeleted",
        pageId: "imagePicker",
      },
      localDateTime: Date.now(),
    };

    window.parent.postMessage(
      { action: AnalyticEventsEnum.generatedImageDeleted, analytic },
      "*"
    );
  };

  const onboardingAnalytic = useCallback(() => {
    const analytic = {
      data: {
        type: "history",
        event: "history",
        pageId: "history",
      },
      localDateTime: Date.now(),
    };

    window.parent.postMessage(
      { action: AnalyticEventsEnum.history, analytic },
      "*"
    );
  }, []);

  useEffect(() => {
    onboardingAnalytic();
    // eslint-disable-next-line
  }, []);

  const hasSelectedImages = selectedImages.length > 0;

  const EmptyPage = () => {
    return (
      <div className={styles.emptyContent}>
        <img src={"./icons/emptyhistory.svg"} alt="Empty icon" />
        <p>
          Once you try on first item your try-on history would be stored here
        </p>
      </div>
    );
  };

  return (
    <>
      <Section className={styles.sectionContent}>
        <>
          <motion.div
            key="history-page"
            className={styles.viewContent}
            {...initiallAnimationConfig}
          >
            {generatedImages.length > 0 ? (
              <>
                <div
                  className={`${styles.imageContent} ${
                    isMobile ? styles.imageContentMobile : ""
                  }`}
                >
                  {generatedImages.map(({ id, url }) => (
                    <SelectableImage
                      key={id}
                      src={url}
                      imageId={id}
                      variant="history"
                      classNames={isMobile ? styles.selectableImageMobile : ""}
                      onClick={() => handleSelectImage(id, url)}
                    />
                  ))}
                </div>

                <HistoryImagesRemoveModal
                  onClickRightButton={handleDeleteSelectedImages}
                  onClickLeftButton={handleCloseHistoryImagesModal}
                />
              </>
            ) : (
              <EmptyPage />
            )}
          </motion.div>
          <div
            className={`${styles.historyBanner} ${
              hasSelectedImages && isMobile
                ? styles.activeHistoryBannerMobile
                : hasSelectedImages
                ? styles.activeHistoryBanner
                : ""
            }`}
          >
            <RemoveHistoryBanner />
          </div>
        </>
      </Section>
    </>
  );
}
