import Image from "next/image";

// types
import { SecondaryButtonTypes } from "./types";

// styles
import styles from "./secondaryButton.module.scss";

export const SecondaryButton = (props: SecondaryButtonTypes) => {
  const { text, iconUrl, classNames, onClick } = props;

  return (
    <button
      className={`${styles.secondaryButton} ${classNames ?? ""}`}
      onClick={onClick}
    >
      {iconUrl && <Image src={iconUrl} alt="Secondary button icon" />}
      <p>{text}</p>
    </button>
  );
};
