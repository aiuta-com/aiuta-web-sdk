import { createSlice } from "@reduxjs/toolkit";

const isOnboardingDone =
  typeof window !== "undefined" &&
  JSON.parse(localStorage.getItem("isOnboarding") || "false");

const hasgenerationButtonConfigs =
  typeof window !== "undefined" &&
  JSON.parse(localStorage.getItem("generationButtonConfigs") || "false");

interface configSliceState {
  qrToken: string;
  isMobile: boolean;
  isOpenSwip: boolean;
  isShowFooter: boolean;
  isShowSpinner: boolean;
  isInitialized: boolean;
  onboardingSteps: number;
  isShowQrSpinner: boolean;
  isOnboardingDone: boolean;
  isSelectHistoryImages: boolean;
  generationButtonConfigs: {
    bt_bg_color: string;
    bt_tx_color: string;
    bt_fontFamily: string;
    bt_borderRadius: string;
  };
}

const initialState: configSliceState = {
  qrToken: "",
  isMobile: false,
  isOpenSwip: false,
  onboardingSteps: 0,
  isShowFooter: true,
  isShowSpinner: false,
  isInitialized: false,
  isShowQrSpinner: false,
  isSelectHistoryImages: false,
  isOnboardingDone: isOnboardingDone,
  generationButtonConfigs: hasgenerationButtonConfigs
    ? hasgenerationButtonConfigs
    : {
        bt_bg_color: "#4000ff",
        bt_tx_color: "#ffffff",
        bt_fontFamily: "GT Maru",
        bt_borderRadius: "12px",
      },
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setQrToken: (state, { payload }) => {
      state.qrToken = payload;
    },
    setIsMobile: (state, { payload }) => {
      state.isMobile = payload;
    },
    setIsOpenSwip: (state, { payload }) => {
      state.isOpenSwip = payload;
    },
    setIsShowQrSpinner: (state, { payload }) => {
      state.isShowQrSpinner = payload;
    },
    setIsInitialized: (state, { payload }) => {
      state.isInitialized = payload;
    },
    setIsShowSpinner: (state, { payload }) => {
      state.isShowSpinner = payload;
    },
    setIsShowFooter: (state, { payload }) => {
      state.isShowFooter = payload;
    },
    setIsOnboardingDone: (state, { payload }) => {
      state.isOnboardingDone = payload;
    },
    setGenerationButtonConfigs: (state, { payload }) => {
      localStorage.setItem("generationButtonConfigs", JSON.stringify(payload));

      state.generationButtonConfigs = payload;
    },
    setOnboardingSteps: (state, { payload }) => {
      if (payload) {
        state.onboardingSteps = payload;
      } else {
        state.onboardingSteps++;
      }
    },
    setIsSelectHistoryImages: (state, { payload }) => {
      state.isSelectHistoryImages = payload;
    },
  },
});
