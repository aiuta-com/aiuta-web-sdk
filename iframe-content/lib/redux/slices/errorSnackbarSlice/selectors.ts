import { RootState } from '../../store'

const showErrorSnackbarStatesSelector = (state: RootState) =>
  state.errorSnackbar.showErrorSnackbarStates

export { showErrorSnackbarStatesSelector }
