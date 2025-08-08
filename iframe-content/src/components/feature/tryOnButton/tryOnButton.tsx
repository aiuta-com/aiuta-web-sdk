import React from "react";
// types
import { TryOnButtonTypes } from "./types";

// styles
import styles from "./tryOnButton.module.scss";

export const TryOnButton = (props: TryOnButtonTypes) => {
  const { disabled, children, isShowTryOnIcon, dynamicStyles, onClick } = props;

  return (
    <button
      style={
        dynamicStyles
          ? {
              color: dynamicStyles.bt_tx_color,
              background: dynamicStyles.bt_bg_color,
              fontFamily: dynamicStyles.bt_fontFamily,
              borderRadius: dynamicStyles.bt_borderRadius,
            }
          : {}
      }
      disabled={disabled}
      className={`${styles.tryOnButton} ${
        disabled ? styles.disabledButton : ""
      }`}
      onClick={onClick}
    >
      <>
        {isShowTryOnIcon && <img alt="Try On icon" src={'/icons/tryOn.svg'} />}{" "}
        {children}
      </>
    </button>
  );
};
