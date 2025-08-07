import { useState, MouseEvent, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// types
import { ViewImageTypes } from "./types";

// styles
import styles from "./viewImage.module.scss";

export const ViewImage = (props: ViewImageTypes) => {
  const {
    url,
    className,
    generatedImageUrl,
    isStartGeneration,
    isShowChangeImageBtn,
    imgUnoptimazed = false,
    onChange,
    onClick,
  } = props;

  const [generatingText, setGeneratingText] = useState("Scanning your body");

  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(`/${path}`);
  };

  const handleOnChange = () => {
    if (typeof onChange === "function") return onChange();

    handleNavigate("previously");
  };

  const handleClickOnImage = (event: MouseEvent<HTMLImageElement>) => {
    if (typeof onClick === "function") onClick(event);
  };

  useEffect(() => {
    if (isStartGeneration) {
      setTimeout(() => {
        setGeneratingText("Generating outfit");
      }, 2000);
    }
  }, [isStartGeneration]);

  return (
    <div
      className={`
        ${styles.viewImageBox} 
        ${isStartGeneration ? styles.startGeneration : ""}
        ${generatedImageUrl ? styles.startShowGeneratedImage : ""}
        ${className ?? ""}
       `}
    >
      {isShowChangeImageBtn && (
        <button className={styles.changeImageBtn} onClick={handleOnChange}>
          Change photo
        </button>
      )}
      <div className={styles.tryOnButtonSecondary}>
        <div className={styles.tryOnBtnSpinner}>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
          <div className={styles.loadingBox}>
            <span className={styles.tryOnHidden}>Loading...</span>
          </div>
        </div>
        <span>{generatingText}</span>
      </div>
      {generatedImageUrl && (
        <Image
          width={280}
          height={460}
          loading="lazy"
          alt="View image"
          src={generatedImageUrl}
          unoptimized={imgUnoptimazed}
          className={styles.newGeneratedImage}
          onClick={handleClickOnImage}
        />
      )}
      <Image
        src={url}
        width={280}
        height={460}
        loading="lazy"
        alt="View image"
        unoptimized={imgUnoptimazed}
        className={styles.tryOnImage}
        onClick={handleClickOnImage}
      />
    </div>
  );
};
