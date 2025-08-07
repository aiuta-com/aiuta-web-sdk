import Image from "next/image";

// components
import { TryOnButton } from "@/components/feature";

// icons
import { tokenBannerGirlIcon } from "../../../../public/icons";

// types
import { EmptyViewImageTypes } from "./types";

// styles
import styles from "./emptyViewImage.module.scss";

export const EmptyViewImage = (props: EmptyViewImageTypes) => {
  const { onClick } = props;

  return (
    <div className={styles.banner}>
      <Image src={tokenBannerGirlIcon} alt="Girl icon" />
      <div className={styles.uploadBtnContent}>
        <TryOnButton onClick={onClick}>Upload a photo of you</TryOnButton>
      </div>
    </div>
  );
};
