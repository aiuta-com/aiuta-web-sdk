import { createSlice } from "@reduxjs/toolkit";

const isOnboardingDone =
  typeof window !== "undefined" &&
  JSON.parse(localStorage.getItem("isOnboarding") || "false");

type StylesConfiguration = {
  pages: {
    qrPageClassName: string;
    historyClassName: string;
    viewPageClassName: string;
    resultPageClassName: string;
    onboardingPageClassName: string;
    previouselyPageClassName: string;
  };
  components: {
    swipClassName: string;
    footerClassName: string;
    headerClassName: string;
    tryOnButtonClassName: string;
    historyBannerClassName: string;
    secondaryButtonClassName: string;
    changePhotoButtonClassName: string;
    resultButonsContentClassName: string;
    historyImagesRemoveModalClassName: string;
  };
};

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
  isSelectPreviouselyImages: boolean;
  stylesConfiguration: StylesConfiguration;
  aiutaEndpointData: {
    skuId: string;
    apiKey: string;
    userId: string;
    jwtToken: string;
  };
}

const INITIALLY_STYLES_CONFIGURATION: StylesConfiguration = {
  pages: {
    qrPageClassName: "",
    historyClassName: "",
    viewPageClassName: "",
    resultPageClassName: "",
    onboardingPageClassName: "",
    previouselyPageClassName: "",
  },
  components: {
    swipClassName: "",
    footerClassName: "",
    headerClassName: "",
    tryOnButtonClassName: "",
    historyBannerClassName: "",
    secondaryButtonClassName: "",
    changePhotoButtonClassName: "",
    resultButonsContentClassName: "",
    historyImagesRemoveModalClassName: "",
  },
};

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
  isSelectPreviouselyImages: false,
  isOnboardingDone: isOnboardingDone,
  stylesConfiguration: INITIALLY_STYLES_CONFIGURATION,
  aiutaEndpointData: {
    skuId: "",
    apiKey: "",
    userId: "",
    jwtToken: "",
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
    setAiutaEndpointData: (state, { payload }) => {
      state.aiutaEndpointData = payload;
    },
    setOnboardingSteps: (state, { payload }) => {
      if (payload) {
        state.onboardingSteps = payload;
      } else {
        state.onboardingSteps++;
      }
    },
    setStylesConfiguration: (state, { payload }) => {
      state.stylesConfiguration = payload;
    },
    setIsSelectHistoryImages: (state, { payload }) => {
      state.isSelectHistoryImages = payload;
    },
    setIsSelectPreviouselyImages: (state, { payload }) => {
      state.isSelectPreviouselyImages = payload;
    },
  },
});
