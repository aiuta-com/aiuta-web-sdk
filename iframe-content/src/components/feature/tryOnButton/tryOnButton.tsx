import React from "react";

// redux
import { useAppSelector } from "@lib/redux/store";

// selectors
import { stylesConfigurationSelector } from "@lib/redux/slices/configSlice/selectors";

// types
import { TryOnButtonTypes } from "./types";

// styles
import styles from "./tryOnButton.module.scss";

export const TryOnButton = (props: TryOnButtonTypes) => {
  const { disabled, children, isShowTryOnIcon, onClick } = props;

  const stylesConfiguration = useAppSelector(stylesConfigurationSelector);

  return (
    <button
      disabled={disabled}
      className={`${styles.tryOnButton} ${
        disabled ? styles.disabledButton : ""
      } ${stylesConfiguration.components.tryOnButtonClassName}`}
      onClick={onClick}
    >
      <>
        {isShowTryOnIcon && <img alt="Try On icon" src={"./icons/tryOn.svg"} />}{" "}
        {children}
      </>
    </button>
  );
};
