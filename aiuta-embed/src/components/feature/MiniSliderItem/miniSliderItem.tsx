import Image from "next/image";

// types
import { MiniSliderItemTypes } from "./types";

// styles
import styles from "./miniSliderItem.module.scss";

export const MiniSliderItem = (props: MiniSliderItemTypes) => {
  const { src, isActive, onClick } = props;

  return (
    <div
      className={`${styles.sliderItem} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      <Image
        src={src}
        width={54}
        height={96}
        unoptimized
        alt="Slider item img"
      />
    </div>
  );
};
