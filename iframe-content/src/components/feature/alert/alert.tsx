import React from "react";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { alertSlice } from "@lib/redux/slices/alertSlice";

// selectors
import { showAlertStatesSelector } from "@lib/redux/slices/alertSlice/selectors";

// components
import { SecondaryButton } from "../secondaryButton/secondaryButton";

// types
import { AlertTypes } from "./types";

// styles
import styles from ".//alert.module.scss";

export const Alert = (props: AlertTypes) => {
  const { onClick } = props;

  const dispatch = useAppDispatch();

  const showAlertStates = useAppSelector(showAlertStatesSelector);

  const { type, content, isShow, buttonText } = showAlertStates;

  const hasCheckContentTyeps = typeof showAlertStates.content === "string";

  const hasError = type === "error";
  const hasFullWidth = onClick && typeof onClick === "function";
  // const hasWarning = type === "warning"; TO DO For future
  // const hasSuccess = type === "success"; TO DO For future

  const onClickEvents = {
    onClose: () => dispatch(alertSlice.actions.setShowAlert({ isShow: false })),
    regenerate: () => {
      dispatch(alertSlice.actions.setShowAlert({ isShow: false }));
    },
  };

  return (
    <div
      className={`${styles.alertContainer} ${hasError ? styles.error : ""} ${
        isShow ? styles.activeAlert : ""
      }`}
    >
      <div className={!hasFullWidth ? styles.fullTextContent : ""}>
        {hasCheckContentTyeps ? <p>{content} </p> : content}
      </div>
      {hasFullWidth && (
        <SecondaryButton
          text={buttonText}
          classNames={styles.button}
          onClick={onClick}
        />
      )}
    </div>
  );
};
