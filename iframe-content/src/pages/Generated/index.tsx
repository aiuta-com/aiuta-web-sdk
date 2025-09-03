import React, {
  UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { motion, easeInOut } from "framer-motion";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { generateSlice } from "@lib/redux/slices/generateSlice";

// selectors
import {
  isMobileSelector,
  stylesConfigurationSelector,
} from "@lib/redux/slices/configSlice/selectors";
import { generatedImagesSelector } from "@lib/redux/slices/generateSlice/selectors";

// components
import GeneratedMobile from "./generatedMobile";
import { GeneratedImageButtons } from "@/components/shared";
import { Section, ViewImage, MiniSliderItem } from "@/components/feature";

// types
import { AnalyticEventsEnum, EndpointDataTypes } from "@/types";

// styles
import styles from "./generated.module.scss";

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

const GENERATED_IMAGE_HEIGHT = 460;
const SLIDE_ITEM_IMAGE_HEIGHT = 96;

let initialAnalyticCompleted = false;

export default function Generated() {
  const [slideItemIndex, setSlideItemIndex] = useState<number>(0);
  const [endpointData, setEndpointData] = useState<EndpointDataTypes | null>(
    null
  );

  const dispatch = useAppDispatch();

  const miniSliderContentRef = useRef<HTMLDivElement | null>(null);
  const generatedImagesContentRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useAppSelector(isMobileSelector);
  const generatedImages = useAppSelector(generatedImagesSelector);
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  const handleClickOnSliderItem = (index: number) => {
    setSlideItemIndex(index);

    const scrollToSliderContent = index * SLIDE_ITEM_IMAGE_HEIGHT - 200;
    const scrollToGeneratedImagesContent = index * GENERATED_IMAGE_HEIGHT;

    if (miniSliderContentRef && miniSliderContentRef.current) {
      miniSliderContentRef.current.scrollTop = scrollToSliderContent;
    }

    if (generatedImagesContentRef && generatedImagesContentRef.current) {
      generatedImagesContentRef.current.scrollTop =
        scrollToGeneratedImagesContent;
    }
  };

  const handleDetectContentScrollPosition = (
    event: UIEvent<HTMLDivElement>
  ) => {
    const target = event.target as HTMLDivElement;

    for (const element of target.children) {
      if ("id" in element) {
        if (+element.id * GENERATED_IMAGE_HEIGHT === target.scrollTop) {
          if (miniSliderContentRef && miniSliderContentRef.current) {
            setSlideItemIndex(+element.id);

            miniSliderContentRef.current.scrollTop =
              +element.id * SLIDE_ITEM_IMAGE_HEIGHT - 200;
          }
        }
      }
    }
  };

  const handleGetWidnwInitiallySizes = () => {
    window.parent.postMessage({ action: "GET_AIUTA_API_KEYS" }, "*");
  };

  const handleShowFullScreen = (activeImage: { id: string; url: string }) => {
    window.parent.postMessage(
      {
        action: "OPEN_AIUTA_FULL_SCREEN_MODAL",
        images: generatedImages,
        modalType: "history",
        activeImage: activeImage,
      },
      "*"
    );
  };

  const handleAnalytic = () => {
    if (initialAnalyticCompleted) return;

    if (endpointData && endpointData.skuId && endpointData.skuId.length > 0) {
      initialAnalyticCompleted = true;

      const analytic = {
        data: {
          type: "page",
          pageId: "results",
          productIds: [endpointData?.skuId],
        },
        localDateTime: Date.now(),
      };

      window.parent.postMessage(
        { action: AnalyticEventsEnum.results, analytic },
        "*"
      );
    }
  };

  useEffect(() => {
    handleAnalytic();
    // eslint-disable-next-line
  }, [endpointData]);

  useEffect(() => {
    handleGetWidnwInitiallySizes();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        if (event.data.status === 200) {
          setEndpointData(event.data);
        }

        if (event.data.type === "REMOVE_HISTORY_IMAGES") {
          dispatch(generateSlice.actions.setGeneratedImage(event.data.images));

          const analytic = {
            data: {
              type: "history",
              event: "generatedImageDeleted",
              pageId: "history",
              productIds: [endpointData?.skuId],
            },
            localDateTime: Date.now(),
          };

          window.parent.postMessage(
            { action: AnalyticEventsEnum.generatedImageDeleted, analytic },
            "*"
          );
        }

        if (event.data.type === "ANALYTIC_SOCIAL_MEDIA") {
          const analytic: any = {
            data: {
              type: "share",
              pageId: "results",
              event: "succeded",
              targetId: "whatsApp",
              productIds: [endpointData?.skuId],
            },
            localDateTime: Date.now(),
          };

          if (event.data.shareMethod === "whatsApp") {
            analytic.data.targetId = "whatsApp";
          } else if (event.data.shareMethod === "messenger") {
            analytic.data.targetId = "messenger";
          } else if (event.data.shareMethod === "copy") {
            analytic.data.targetId = "copy";
          } else if (event.data.shareMethod === "share_close") {
            delete analytic.data["targetId"];
            analytic.data.event = "canceled";
          }

          window.parent.postMessage(
            { action: AnalyticEventsEnum.results, analytic },
            "*"
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
      <Section
        className={`${isMobile ? styles.sectionMobile : ""} ${
          stylesConfiguration.pages.resultPageClassName
        }`}
      >
        <motion.div
          key="generated-page"
          className={styles.viewContent}
          {...initiallAnimationConfig}
        >
          {isMobile ? (
            <GeneratedMobile />
          ) : (
            <>
              <div
                ref={generatedImagesContentRef}
                className={styles.generatedImagesScrollableView}
                onScrollEnd={handleDetectContentScrollPosition}
              >
                {generatedImages.length > 1 ? (
                  <div
                    ref={miniSliderContentRef}
                    className={styles.generatedImagesSlider}
                  >
                    {generatedImages.map(({ id, url }, index) => {
                      return (
                        <MiniSliderItem
                          key={id}
                          src={url}
                          isActive={slideItemIndex === index}
                          onClick={() => handleClickOnSliderItem(index)}
                        />
                      );
                    })}
                  </div>
                ) : null}
                {generatedImages
                  ? generatedImages.map(({ id, url }, index) => {
                      return (
                        <div key={id} id={String(index)}>
                          <ViewImage
                            url={url}
                            imgUnoptimazed={true}
                            isStartGeneration={false}
                            className={styles.viewItem}
                            isShowChangeImageBtn={false}
                            onClick={() => handleShowFullScreen({ id, url })}
                          />
                        </div>
                      );
                    })
                  : null}
              </div>
              {generatedImages && generatedImages.length > 0 ? (
                <GeneratedImageButtons
                  activeGeneratedImageUrl={generatedImages[slideItemIndex].url}
                />
              ) : null}
            </>
          )}
        </motion.div>
      </Section>
    </>
  );
}
