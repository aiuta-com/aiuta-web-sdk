  // redux
  import { useAppSelector, useAppDispatch } from "@lib/redux/store";

  // actions
  import { fileSlice } from "@lib/redux/slices/fileSlice";

  // selectors
  import { fullScreenImageUrlSelector } from "@lib/redux/slices/fileSlice/selectors";

  // styles
  import styles from "./fullScreenImageModal.module.scss";

  export const FullScreenImageModal = () => {
    const dispatch = useAppDispatch();

    const fullScreenImageUrl = useAppSelector(fullScreenImageUrlSelector);

    const handleCloseModa = () => {
      dispatch(fileSlice.actions.setFullScreenImageUrl(null));
    };

    return fullScreenImageUrl ? (
      <div className={styles.fullScreenModal}>
        <div className={styles.closeIconBox} onClick={handleCloseModa}>
          <img src={'./icons/close.svg'} alt="Close Icon" className={styles.closeIcon} />
        </div>
        <img
          width={100}
          height={100}
          alt="Full Screen Image"
          src={fullScreenImageUrl}
          className={styles.fullImage}
        />
      </div>
    ) : (
      <></>
    );
  };
