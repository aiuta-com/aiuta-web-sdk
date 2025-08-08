import { useQRCode } from "next-qrcode";
import { QrSpinner } from "../animationIcons";

// redux

import { useAppSelector } from "@lib/redux/store";

// selectors
import { isShowQrSpinnerSelector } from "@lib/redux/slices/configSlice/selectors";

// types
import { QrCodeTypes } from "./types";

// styles
import styles from "./qrCode.module.scss";

export const QrCode = (props: QrCodeTypes) => {
  const { url, isShowQrInfo = true, onChange } = props;

  const { Canvas } = useQRCode();

  const isShowQrSpinner = useAppSelector(isShowQrSpinnerSelector);

  return (
    <div className={styles.qrContent}>
      <div className={styles.qrBox}>
        {isShowQrSpinner ? (
          <div className={styles.spinnerOverlay}>
            <QrSpinner />
          </div>
        ) : null}
        <Canvas
          text={url}
          logo={{
            options: { width: 52 },
            src: isShowQrSpinner ? "" : "/icons/aiutaLogo.svg",
          }}
          options={{
            errorCorrectionLevel: "M",
            width: 220,
            color: {
              dark: "#000000",
              light: "#F2F2F7",
            },
          }}
        />
      </div>
      {isShowQrInfo && (
        <div className={styles.infoContent}>
          <p className={styles.text}>Scan the QR code </p>
          <p className={`${styles.text} ${styles.secondaryText}`}>Or</p>
          <label
            htmlFor="upload-file"
            className={`${styles.text} ${styles.primaryText}`}
          >
            Click here to upload
            <input onChange={onChange} type="file" id="upload-file" />
          </label>
        </div>
      )}
    </div>
  );
};
