import React from "react";

// redux
import { useAppSelector } from "@lib/redux/store";

// selectors
import { stylesConfigurationSelector } from "@lib/redux/slices/configSlice/selectors";

// types
import { SecondaryButtonTypes } from "./types";

// styles
import styles from "./secondaryButton.module.scss";

export const SecondaryButton = (props: SecondaryButtonTypes) => {
  const { text, iconUrl, classNames, onClick } = props;

  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  return (
    <button
      className={`${styles.secondaryButton} ${classNames ?? ""} ${
        stylesConfiguration.components.secondaryButtonClassName
      }`}
      onClick={onClick}
    >
      {iconUrl && <img src={iconUrl} alt="Secondary button icon" />}
      <p>{text}</p>
    </button>
  );
};
