import { RootState } from '@/store/store'

export const errorSnackbarSelector = (state: RootState) => state.errorSnackbar.errorSnackbar

export const isErrorSnackbarVisibleSelector = (state: RootState) =>
  state.errorSnackbar.errorSnackbar.isVisible
