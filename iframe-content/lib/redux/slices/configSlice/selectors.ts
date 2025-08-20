import { RootState } from "../../store";

const isOnboardingDoneSelector = (state: RootState) =>
  state.config.isOnboardingDone;

const isMobileSelector = (state: RootState) => state.config.isMobile;

const isShowQrSpinnerSelector = (state: RootState) =>
  state.config.isShowQrSpinner;

const isSelectHistoryImagesSelector = (state: RootState) =>
  state.config.isSelectHistoryImages;

const qrTokenSelector = (state: RootState) => state.config.qrToken;

const isOpenSwipSelector = (state: RootState) => state.config.isOpenSwip;

const isShowFooterSelector = (state: RootState) => state.config.isShowFooter;

const isInitializedSelector = (state: RootState) => state.config.isInitialized;

const isShowSpinnerSelector = (state: RootState) => state.config.isShowSpinner;

const onboardingStepsSelector = (state: RootState) =>
  state.config.onboardingSteps;

const stylesConfigurationSelector = (state: RootState) =>
  state.config.stylesConfiguration;

export {
  qrTokenSelector,
  isMobileSelector,
  isOpenSwipSelector,
  isShowFooterSelector,
  isShowSpinnerSelector,
  isInitializedSelector,
  isShowQrSpinnerSelector,
  onboardingStepsSelector,
  isOnboardingDoneSelector,
  stylesConfigurationSelector,
  isSelectHistoryImagesSelector,
};
