import { MiniSliderItemTypes } from "./types";
import styles from "./miniSliderItem.module.scss";

export const MiniSliderItem = (props: MiniSliderItemTypes) => {
  const { src, isActive, onClick } = props;

  return (
    <div
      className={`${styles.sliderItem} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      <img
        src={src}
        width={54}
        height={96}
        alt="Slider item img"
      />
    </div>
  );
};
