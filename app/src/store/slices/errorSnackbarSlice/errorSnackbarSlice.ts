import { createSlice } from '@reduxjs/toolkit'

interface ErrorSnackbarState {
  isVisible: boolean
  errorMessage: string
  retryButtonText: string
}

interface ErrorSnackbarSliceState {
  errorSnackbar: ErrorSnackbarState
}

const initialState: ErrorSnackbarSliceState = {
  errorSnackbar: {
    isVisible: false,
    errorMessage: '',
    retryButtonText: '',
  },
}

export const errorSnackbarSlice = createSlice({
  name: 'errorSnackbar',
  initialState,
  reducers: {
    showErrorSnackbar: (state, { payload }: { payload: Omit<ErrorSnackbarState, 'isVisible'> }) => {
      state.errorSnackbar = {
        ...payload,
        isVisible: true,
      }
    },
    hideErrorSnackbar: (state) => {
      state.errorSnackbar.isVisible = false
    },
  },
})
