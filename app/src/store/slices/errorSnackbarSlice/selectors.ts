import { RootState } from '@/store/store'

const showErrorSnackbarStatesSelector = (state: RootState) =>
  state.errorSnackbar.showErrorSnackbarStates

export { showErrorSnackbarStatesSelector }
