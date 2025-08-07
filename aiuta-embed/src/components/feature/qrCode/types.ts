import { ChangeEvent } from "react";

export type QrCodeTypes = {
  url: string;
  isShowQrInfo?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};
