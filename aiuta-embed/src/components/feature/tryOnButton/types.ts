import { ReactElement } from "react";

export type TryOnButtonTypes = {
  disabled?: boolean;
  onClick: () => void;
  isShowTryOnIcon?: boolean;
  children: string | ReactElement;
  dynamicStyles?: {
    bt_bg_color: string;
    bt_tx_color: string;
    bt_fontFamily: string;
    bt_borderRadius: string;
  };
};
