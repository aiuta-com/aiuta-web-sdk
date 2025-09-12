import { createSlice } from '@reduxjs/toolkit'

interface ErrorSnackbarState {
  isVisible: boolean
  errorMessage: string
  retryButtonText: string
}

const initialState: ErrorSnackbarState = {
  isVisible: false,
  errorMessage: '',
  retryButtonText: '',
}

export const errorSnackbarSlice = createSlice({
  name: 'errorSnackbar',
  initialState,
  reducers: {
    showErrorSnackbar: (state, { payload }: { payload: Omit<ErrorSnackbarState, 'isVisible'> }) => {
      state.errorMessage = payload.errorMessage
      state.retryButtonText = payload.retryButtonText
      state.isVisible = true
    },
    hideErrorSnackbar: (state) => {
      state.isVisible = false
    },
  },
})
