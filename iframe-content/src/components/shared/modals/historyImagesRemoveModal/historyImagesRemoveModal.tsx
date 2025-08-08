import React from "react";
// redux
import { useAppSelector } from "@lib/redux/store";

// selectors
import { showHistoryImagesModalSelector } from "@lib/redux/slices/modalSlice/selectors";

// components
import { SecondaryButton } from "@/components/feature";

// types
import { HistoryImagesRemoveModalTypes } from "./types";

// styles
import styles from "./historyImagesRemoveModal.module.scss";

export const HistoryImagesRemoveModal = (
  props: HistoryImagesRemoveModalTypes
) => {
  const { onClickLeftButton, onClickRightButton } = props;

  const showHistoryImagesModal = useAppSelector(showHistoryImagesModalSelector);

  return (
    <div
      className={`${styles.historyImagesModal} ${
        showHistoryImagesModal ? styles.historyImagesModalActive : ""
      }`}
    >
      <div className={styles.moadlContent}>
        <h3 className={styles.text}>
          Are you sure that you want to delete this try-ons?
        </h3>
        <div className={styles.buttonsLine}>
          <SecondaryButton text="Keep" onClick={onClickLeftButton} />
          <SecondaryButton text="Delete" onClick={onClickRightButton} />
        </div>
      </div>
    </div>
  );
};
